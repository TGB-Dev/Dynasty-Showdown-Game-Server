import { BadRequestException, Injectable } from '@nestjs/common';
import { CdvqTimerService } from './cdvq-timer.service';
import { CdvqQuestionRepository } from './cdvq-question.repository';
import { CdvqGameState } from '../common/enum/cdvq/cdvq-game-state.enum';
import { CdvqRoundState } from '../common/enum/cdvq/cdvq-round-state.enum';
import { CdvqQuestion } from '../schemas/cdvq/cdvq-question.schema';
import { CdvqGateway } from './cdvq.gateway';
import { CdvqQuestionStatus } from '../common/enum/cdvq/cdvq-question-status.enum';
import { User } from '../schemas/user.schema';
import { CdvqSubmissionRepository } from './cdvq-submission.repository';

const ROUND_DURATION = 30;
const READY_DURATION = 3;
const SHOW_ANSWER_DURATION = 7;
const SHOW_RESULT_DURATION = 7;

const SCORE_CRITERIA = [
  {
    users: 2,
    score: 20,
  },
  {
    users: 2,
    score: 15,
  },
  {
    users: Infinity,
    score: 10,
  },
];

@Injectable()
export class CdvqGameService {
  private gameState = CdvqGameState.NOT_PLAYING;
  private roundState = CdvqRoundState.WAITING;
  private currentQuestion: CdvqQuestion | null;

  constructor(
    private readonly timerService: CdvqTimerService,
    private readonly questionRepository: CdvqQuestionRepository,
    private readonly submissionRepository: CdvqSubmissionRepository,
    private readonly gateway: CdvqGateway,
  ) {}

  async startGame() {
    if (this.gameState !== CdvqGameState.NOT_PLAYING) {
      throw new BadRequestException('Game already started');
    }

    await this.resetQuestions();

    this.gameState = CdvqGameState.PLAYING;
    void (async () => {
      await this.timerService.start(READY_DURATION, (timeLeft) => this.gateway.emitReadyTimer(timeLeft));
      await this.startRound();
    })();
  }

  stopGame() {
    if (this.gameState === CdvqGameState.NOT_PLAYING) {
      throw new BadRequestException('Game already stopped');
    }

    this.endGame();
    this.gateway.leaveRoom();
    this.timerService.stop();
  }

  pauseGame() {
    if (this.gameState === CdvqGameState.PAUSED || this.gameState === CdvqGameState.NOT_PLAYING) {
      throw new BadRequestException('Game already paused or not started');
    }

    this.gameState = CdvqGameState.PAUSED;
    this.timerService.pause();
    this.gateway.emitGamePaused();
  }

  resumeGame() {
    if (this.gameState !== CdvqGameState.PAUSED) {
      throw new BadRequestException('Game not paused');
    }

    this.gameState = CdvqGameState.PLAYING;
    this.gateway.emitGameResumed();

    void (async () => {
      await this.timerService.resume();
      switch (this.roundState) {
        case CdvqRoundState.WAITING || CdvqRoundState.SHOWING_RESULT:
          await this.startRound();
          break;
        case CdvqRoundState.ANSWERING:
          await this.showAnswerPhase();
          await this.showResultPhase();
          break;
        case CdvqRoundState.SHOWING_ANSWER:
          await this.showResultPhase();
          break;
      }
    })();
  }

  getCurrentQuestion() {
    return this.currentQuestion;
  }

  async answerCurrentQuestion(user: User, answer: string) {
    if (this.gameState !== CdvqGameState.PLAYING) {
      throw new BadRequestException('Game is not currently playing');
    }

    if (this.roundState !== CdvqRoundState.ANSWERING) {
      throw new BadRequestException('Round is not currently answering');
    }

    if (!this.currentQuestion) {
      throw new BadRequestException('No current question available');
    }

    if (await this.submissionRepository.getByUserIdAndQuestionId(user._id!, this.currentQuestion._id!))
      throw new BadRequestException('User has already submitted an answer');

    const submission = {
      user,
      question: this.currentQuestion._id,
      answer,
    };

    return this.submissionRepository.create(submission);
  }

  getRoundResults() {
    if (this.roundState !== CdvqRoundState.SHOWING_RESULT) {
      throw new BadRequestException('Round is not currently showing result');
    }

    return this.submissionRepository.getAll();
  }

  async getCurrentQuestionAnswer(user: User) {
    if (this.roundState !== CdvqRoundState.SHOWING_ANSWER) {
      throw new BadRequestException('Game is not currently showing answer');
    }

    const submission = (
      await this.submissionRepository.getByUserIdAndQuestionId(user._id!, this.currentQuestion!._id!)
    )?.toObject();

    return {
      answer: this.currentQuestion!.answer,
      correct: !submission ? false : submission.isCorrect,
    };
  }

  private async startRound() {
    await this.submissionRepository.deleteAll();
    this.currentQuestion = (await this.questionRepository.getFirstWaiting())?.toObject() ?? null;

    if (this.currentQuestion === null) {
      this.endGame();
      return;
    }

    await this.showQuestionPhase();
    await this.showAnswerPhase();
    await this.showResultPhase();

    await this.startRound();
  }

  private async showQuestionPhase() {
    this.gateway.emitQuestion();

    this.roundState = CdvqRoundState.ANSWERING;
    await this.timerService.start(ROUND_DURATION, (timeLeft) => this.gateway.emitTimerUpdate(timeLeft));

    await this.questionRepository.updateStatus(this.currentQuestion!, CdvqQuestionStatus.COMPLETED);
  }

  private async showAnswerPhase() {
    this.roundState = CdvqRoundState.SHOWING_ANSWER;

    await this.calculateScore();
    this.gateway.emitAnswer();

    await this.timerService.start(SHOW_ANSWER_DURATION, (timeLeft) => this.gateway.emitTimerUpdate(timeLeft));
  }

  private async checkSubmissionAnswers() {
    const submissions = await this.submissionRepository.getAll();
    await Promise.all(
      submissions.map((submission) =>
        this.submissionRepository.updateIsCorrect(submission, submission.answer === submission.question.answer),
      ),
    );
  }

  private async calculateScore() {
    await this.checkSubmissionAnswers();

    const correctSubmissions = await this.submissionRepository.getAllCorrect();

    let start = 0;
    for (const criterion of SCORE_CRITERIA) {
      const end = start + criterion.users;
      const submissions = correctSubmissions.slice(start, end);

      await Promise.all(
        submissions.map((submission) => this.submissionRepository.updateScore(submission, criterion.score)),
      );

      start = end;
    }
  }

  private async showResultPhase() {
    this.roundState = CdvqRoundState.SHOWING_RESULT;
    this.gateway.emitResult();
    await this.timerService.start(SHOW_RESULT_DURATION, (timeLeft) => this.gateway.emitTimerUpdate(timeLeft));
  }

  private endGame() {
    this.gameState = CdvqGameState.NOT_PLAYING;
    this.gateway.emitGameEnded();
  }

  private async resetQuestions() {
    const questions = await this.questionRepository.getAll();

    await Promise.all(
      questions.map((question) => this.questionRepository.updateStatus(question, CdvqQuestionStatus.WAITING)),
    );
    await this.submissionRepository.deleteAll();
  }
}
