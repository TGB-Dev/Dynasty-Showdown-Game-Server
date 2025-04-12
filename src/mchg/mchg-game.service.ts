import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MchgTimerService } from './mchg-timer.service';
import { MchgGateway } from './mchg.gateway';
import { MchgGameState, MchgStage } from '../common/enum/mchg/mchgStage.enum';
import { MchgRoundRepository } from './mchg-round.repository';
import { MchgQuestionRepository } from './mchg-question.repository';
import { MchgSubmissionRepository } from './mchg-submission.repository';
import { User } from '../schemas/user.schema';
import { MchgAnswerQueueService } from './mchg-answer-queue.service';
import { UserRepository } from '../user/user.repository';
import { MchgSubmission } from '../schemas/mchg/mchgSubmission.schema';
import mongoose from 'mongoose';

const MAIN_ANSWER_POINTS = 150;
const SUB_ANSWER_POINTS = 15;
const ROUND_COUNT = 3;
const SHOWING_ANSWER_DELAY_DURATION = 10;
const ANSWERING_SUB_QUESTION_DURATION = 30;

@Injectable()
export class MchgGameService {
  private roundIndex: number = 0;
  private roundStage: MchgStage = MchgStage.CHOOSING_QUESTION;
  private gameState = MchgGameState.NOT_RUNNING;

  constructor(
    private readonly timerService: MchgTimerService,
    private readonly gateway: MchgGateway,
    private readonly roundRepository: MchgRoundRepository,
    private readonly questionRepository: MchgQuestionRepository,
    private readonly submissionRepository: MchgSubmissionRepository,
    private readonly answerQueueService: MchgAnswerQueueService,
    private readonly userRepository: UserRepository,
  ) {}

  async reset() {
    this.roundIndex = 0;
    this.roundStage = MchgStage.CHOOSING_QUESTION;
    this.gameState = MchgGameState.NOT_RUNNING;
    await this.questionRepository.reset();
    await this.answerQueueService.clear();
    await this.submissionRepository.deleteAll();
  }

  async runGame() {
    await this.reset();
    this.gameState = MchgGameState.RUNNING;

    void (async () => {
      await this.timerService.start(3, (rem) => this.gateway.updateRunGameTimer(rem));
      void this.runRound();
    })();
  }

  pauseGame() {
    this.timerService.pause();
    this.gameState = MchgGameState.PAUSED;
    this.gateway.pauseGame();
  }

  resumeGame() {
    this.gameState = MchgGameState.RUNNING;
    this.gateway.resumeGame();

    void this.runRound();
    void this.timerService.resume();
  }

  async getCurrentRound() {
    if (this.gameState === MchgGameState.NOT_RUNNING) {
      throw new BadRequestException('Game is not running');
    }

    const round = await this.roundRepository.getByOrder(this.roundIndex);
    return (await round.populate(['questions', 'currentQuestion'] as const)).toObject();
  }

  async submitAnswer(answer: string, user: User) {
    const question = await this.getCurrentQuestion();

    if (question === null) throw new BadRequestException('No current question');

    const submission = {
      question: question._id,
      user: user._id,
      answer,
    };

    return this.submissionRepository.create(submission);
  }

  async requestAnswerMainQuestion(user: User) {
    if (this.roundStage === MchgStage.UPDATE_RESULTS) {
      throw new BadRequestException('Cannot request main question answer at this time');
    }

    await this.answerQueueService.enqueue(user);

    if (this.roundStage === MchgStage.ANSWERING_MAIN_QUESTION) return;

    const lastStage = this.roundStage;
    this.roundStage = MchgStage.ANSWERING_MAIN_QUESTION;
    await this.runRound();
    this.roundStage = lastStage;
  }

  async nextWaitingUserMainQuestion() {
    await this.answerQueueService.dequeue();

    if ((await this.answerQueueService.length()) === 0) {
      void this.runRound();
    }
  }

  async acceptCurrentUserMainQuestionAnswer() {
    const queueItem = await this.answerQueueService.top();

    if (!queueItem) {
      throw new BadRequestException('No user in queue');
    }

    const user = queueItem.user;
    await this.userRepository.increaseScore(user._id!, MAIN_ANSWER_POINTS);
    await this.answerQueueService.clear();

    void this.runRound();
  }

  getCurrentRequestUser() {
    return this.answerQueueService.top();
  }

  async selectQuestion(index: number) {
    if (this.roundStage === MchgStage.ANSWERING_SUB_QUESTION || this.roundStage === MchgStage.ANSWERING_MAIN_QUESTION) {
      throw new BadRequestException('Question is already running');
    }

    const currentRound = await this.getCurrentRound();
    const question = currentRound.questions[index];

    if (question.selected) throw new BadRequestException('Question already selected');

    await this.questionRepository.updateSelected(question._id, true);

    currentRound.currentQuestion = question._id;
    await this.roundRepository.update(currentRound._id, currentRound);

    this.gateway.broadcastQuestion(question);
    this.roundStage = MchgStage.ANSWERING_SUB_QUESTION;

    void this.runRound();
  }

  async getCurrentQuestionAnswer(userId: mongoose.Types.ObjectId) {
    const currentQuestion = await this.getCurrentQuestion();
    const submission = await this.submissionRepository.findByUserIdAndQuestionId(userId, currentQuestion._id);

    if (!submission) {
      throw new NotFoundException(`Unable to find submission with user ${userId.toHexString()}`);
    }

    return {
      ...submission,
      isCorrect: this.isCorrect(submission),
    };
  }

  private async runRound() {
    if (this.roundIndex >= ROUND_COUNT) {
      this.gameState = MchgGameState.NOT_RUNNING;
      this.gateway.endGame();
      this.gateway.leaveRoom();
      return;
    }

    switch (this.roundStage) {
      case MchgStage.CHOOSING_QUESTION:
        await this.choosingQuestionPhase();
        break;

      case MchgStage.ANSWERING_MAIN_QUESTION:
        this.answeringMainAnswerPhase();
        break;

      case MchgStage.ANSWERING_SUB_QUESTION:
        await this.answeringSubQuestionPhase();
        break;

      case MchgStage.SHOWING_SUB_QUESTION_ANSWER:
        await this.showingSubQuestionAnswerPhase();
        break;

      case MchgStage.UPDATE_RESULTS:
        await this.updateResultsPhase();
        break;
    }
  }

  private async choosingQuestionPhase() {
    this.gateway.updateStage(MchgStage.CHOOSING_QUESTION);

    const currentRound = await this.roundRepository.getByOrder(this.roundIndex);
    const availableQuestions = currentRound.questions.filter((question) => !question.selected);

    if (availableQuestions.length === 0) {
      this.roundStage = MchgStage.UPDATE_RESULTS;
      await this.runRound();
    }
  }

  private answeringMainAnswerPhase() {
    this.gateway.updateStage(MchgStage.ANSWERING_MAIN_QUESTION);

    this.timerService.pause();
  }

  private async answeringSubQuestionPhase() {
    this.gateway.updateStage(MchgStage.ANSWERING_SUB_QUESTION);

    if (this.timerService.isPaused()) {
      await this.timerService.resume();
    } else {
      await this.timerService.start(ANSWERING_SUB_QUESTION_DURATION, (rem) => this.gateway.updateTimer(rem));
    }

    this.roundStage = MchgStage.SHOWING_SUB_QUESTION_ANSWER;
    await this.runRound();
  }

  private async showingSubQuestionAnswerPhase() {
    this.gateway.updateStage(MchgStage.SHOWING_SUB_QUESTION_ANSWER);

    await this.markCurrentQuestionSolved();
    await this.timerService.start(SHOWING_ANSWER_DELAY_DURATION, (rem) => this.gateway.updateTimer(rem));

    this.roundStage = MchgStage.CHOOSING_QUESTION;
    await this.runRound();
  }

  private async updateResultsPhase() {
    await this.updateScores();

    this.roundIndex++;
    this.roundStage = MchgStage.CHOOSING_QUESTION;

    this.gateway.updateRound(this.roundIndex);

    await this.runRound();
  }

  private async markCurrentQuestionSolved() {
    const currentRound = await this.getCurrentRound();

    if (!currentRound.currentQuestion) {
      throw new BadRequestException('No currently running question');
    }

    const currentQuestionSubmissions = await this.submissionRepository.getAllByQuestionId(
      currentRound.currentQuestion._id,
    );

    const correctSubmissions = currentQuestionSubmissions.filter((submission) => this.isCorrect(submission.toObject()));

    if (correctSubmissions.length > 0) {
      await this.questionRepository.updateSolved(currentRound.currentQuestion, true);
    }
  }

  private async getCurrentQuestion() {
    const currentRound = await this.getCurrentRound();

    if (!currentRound.currentQuestion) {
      throw new BadRequestException('No current question');
    }

    return (await this.questionRepository.findById(currentRound.currentQuestion))!.toObject();
  }

  private isCorrect(submission: MchgSubmission) {
    return submission.answer.trim().toLowerCase() === submission.question.answer.trim().toLowerCase();
  }

  private async updateScores() {
    const submissions = await this.submissionRepository.getAll();

    for (const submission of submissions) {
      if (this.isCorrect(submission)) {
        this.userRepository.increaseScore(submission.user._id!, SUB_ANSWER_POINTS);
      }
    }

    await this.submissionRepository.deleteAll();
  }
}
