import { BadRequestException, Injectable } from '@nestjs/common';
import { CdvqTimerService } from './cdvq-timer.service';
import { CdvqQuestionRepository } from './cdvq-question.repository';
import { CdvqGameState } from '../common/enum/cdvq/cdvq-game-state.enum';
import { CdvqRoundState } from '../common/enum/cdvq/cdvq-round-state.enum';
import { CdvqQuestion } from '../schemas/cdvq/cdvq-question-schema';
import { CdvqGateway } from './cdvq.gateway';
import { CdvqQuestionStatus } from '../common/enum/cdvq/cdvq-question-status.enum';

const ROUND_DURATION = 30;
const READY_DURATION = 3;
const SHOW_ANSWER_DURATION = 10;
const SHOW_RESULT_DURATION = 15;

@Injectable()
export class CdvqGameService {
  constructor(
    private readonly timerService: CdvqTimerService,
    private readonly questionRepository: CdvqQuestionRepository,
    private readonly gateway: CdvqGateway,
  ) {}

  private gameState = CdvqGameState.NOT_PLAYING;
  private roundState = CdvqRoundState.WAITING;
  private currentQuestion: CdvqQuestion | null;

  startGame() {
    if (this.gameState !== CdvqGameState.NOT_PLAYING) {
      throw new BadRequestException('Game already started');
    }

    this.gameState = CdvqGameState.PLAYING;
    void (async () => {
      await this.timerService.start(READY_DURATION, (timeLeft) => this.gateway.emitReadyTimer(timeLeft));
      await this.startRound();
    })();
  }

  private async startRound() {
    this.currentQuestion = await this.questionRepository.getFirstWaiting();

    if (this.currentQuestion === null) {
      await this.endGame();
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

  private showAnswerPhase() {
    this.roundState = CdvqRoundState.SHOWING_ANSWER;
    this.gateway.emitAnswer();

    return this.timerService.start(SHOW_ANSWER_DURATION, (timeLeft) => this.gateway.emitTimerUpdate(timeLeft));
  }

  private showResultPhase() {
    this.roundState = CdvqRoundState.SHOWING_RESULT;
    this.gateway.emitResult();
    return this.timerService.start(SHOW_RESULT_DURATION, (timeLeft) => this.gateway.emitTimerUpdate(timeLeft));
  }

  private async endGame() {
    this.gameState = CdvqGameState.NOT_PLAYING;
    this.gateway.emitGameEnded();
    await this.resetQuestions();
  }

  private async resetQuestions() {
    const questions = await this.questionRepository.getAll();

    await Promise.all(
      questions.map((question) => this.questionRepository.updateStatus(question, CdvqQuestionStatus.WAITING)),
    );
  }

  getCurrentQuestion() {
    return this.currentQuestion;
  }
}
