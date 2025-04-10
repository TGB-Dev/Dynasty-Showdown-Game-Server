import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MchgTimerService } from './mchg-timer.service';
import { MchgGateway } from './mchg.gateway';
import { MchgStage } from '../common/enum/mchg/mchgStage.enum';
import { MchgRoundRepository } from './mchg-round.repository';
import { MchgQuestionRepository } from './mchg-question.repository';
import { MchgSubmissionRepository } from './mchg-submission.repository';
import { User } from '../schemas/user.schema';
import mongoose from 'mongoose';
import { MchgAnswerQueueService } from './mchg-answer-queue.service';
import { UserRepository } from '../user/user.repository';

const MAIN_ANSWER_POINTS = 150;
const SUB_ANSWER_POINTS = 15;

@Injectable()
export class MchgGameService {
  constructor(
    private readonly timerService: MchgTimerService,
    private readonly gateway: MchgGateway,
    private readonly roundRepository: MchgRoundRepository,
    private readonly questionRepository: MchgQuestionRepository,
    private readonly submissionRepository: MchgSubmissionRepository,
    private readonly answerQueueService: MchgAnswerQueueService,
    private readonly userRepository: UserRepository,
  ) {}

  private roundIndex: number | null = null;
  private currentStage: MchgStage = MchgStage.CHOOSING_QUESTION;
  private lastStage: MchgStage = MchgStage.CHOOSING_QUESTION;

  runGame() {
    this.roundIndex = 0;
    void (async () => {
      await this.timerService.start(3, (rem) => this.gateway.updateRunGameTimer(rem));
      void this.runRound();
    })();
  }

  pauseGame() {
    this.lastStage = this.currentStage;
    this.currentStage = MchgStage.PAUSED;
    this.gateway.pauseGame();
  }

  resumeGame() {
    this.currentStage = this.lastStage;
    this.lastStage = MchgStage.PAUSED;
    this.gateway.resumeGame();

    void this.runRound();
  }

  private async runRound() {
    // if (this.roundIndex && this.roundIndex >= this.roundCount) {
    //   return;
    // }
    //
    // if (this.currentStage === MchgStage.PAUSED) {
    //   return;
    // }
    //
    // if (this.currentStage === MchgStage.CHOOSING_QUESTION) {
    //   this.mchgGateway.updateStage(this.currentStage);
    //   // Wait for admin interactions, the stage will be changed to MchgStage.ANSWERING_SUB_QUESTION
    //   return;
    // }
    //
    // if (this.currentStage === MchgStage.ANSWERING_SUB_QUESTION) {
    //   if (this.selectedQuestionNum === this.totalQuestionNum) {
    //     this.answerMainAnswer();
    //   }
    //
    //   this.mchgGateway.updateStage(this.currentStage);
    //   await this.startTimer(30, (rem) => this.mchgGateway.updateTimer(rem));
    //
    //   this.lastStage = this.currentStage;
    //   this.currentStage = MchgStage.UPDATE_RESULTS;
    //   await this.runRound();
    // }
    //
    // if (this.currentStage === MchgStage.UPDATE_RESULTS) {
    //   this.mchgGateway.broadcastAnswers();
    //   await this.updateScores();
    //   this.mchgGateway.updateStage(this.currentStage);
    //   this.mchgGateway.updateSolvedQuestions(await this.mchgQuestionRepository.getSolved());
    //
    //   await this.startTimer(5, (rem) => this.mchgGateway.updateTimer(rem));
    //
    //   this.lastStage = this.currentStage;
    //   this.currentStage = MchgStage.CHOOSING_QUESTION;
    //   this.roundIndex!++;
    //   this.mchgGateway.updateRound(this.roundIndex!);
    // }
  }

  answerMainAnswer() {
    if (this.currentStage === MchgStage.UPDATE_RESULTS) {
      return;
    }

    this.lastStage = this.currentStage;
    this.currentStage = MchgStage.ANSWERING_MAIN_QUESTION;
    this.timerService.stop();
    this.gateway.answerMainAnswer();
  }

  async getCurrentRound() {
    if (this.roundIndex === null) {
      throw new BadRequestException('Game is not running');
    }

    const round = await this.roundRepository.getByOrder(this.roundIndex);
    const roundPopulated = await round.populate(['questions', 'currentQuestion'] as const);
    return roundPopulated.toObject();
  }

  private async getCurrentQuestion() {
    const currentRound = await this.getCurrentRound();

    if (!currentRound.currentQuestion) {
      throw new BadRequestException('No current question');
    }

    return this.questionRepository.findById(currentRound.currentQuestion);
  }

  async submitAnswer(answer: string, user: User) {
    const currentQuestion = await this.getCurrentQuestion();

    if (currentQuestion === null) throw new BadRequestException('No current question');

    const submission = {
      question: currentQuestion,
      answer,
      user,
    };

    return this.submissionRepository.create(submission);
  }

  async requestAnswerMainQuestion(user: User) {
    if (this.currentStage === MchgStage.UPDATE_RESULTS) {
      return;
    }

    await this.answerQueueService.enqueue(user);
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
    // No other teams can answer the question
    await this.answerQueueService.clear();
    void this.runRound();
  }

  async selectQuestion(id: string) {
    const question = await this.questionRepository.findById(id);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const currentRound = await this.getCurrentRound();
    currentRound.currentQuestion = new mongoose.Types.ObjectId(id);
    await this.roundRepository.update(currentRound._id, currentRound);

    this.gateway.broadcastQuestion(question);

    this.lastStage = this.currentStage;
    this.currentStage = MchgStage.ANSWERING_SUB_QUESTION;
    void this.runRound();
  }

  private async updateScores() {
    const submissions = await this.submissionRepository.getAll();

    for (const submission of submissions) {
      if (submission.answer.trim().toLowerCase() === submission.question.answer.trim().toLowerCase()) {
        this.userRepository.increaseScore(submission.user._id!, SUB_ANSWER_POINTS);
      }
    }

    await this.submissionRepository.deleteAll();
  }

  async getCurrentQuestionAnswer() {
    const question = await this.getCurrentQuestion();

    if (!question) {
      throw new BadRequestException('No current question');
    }

    return question.answer;
  }
}
