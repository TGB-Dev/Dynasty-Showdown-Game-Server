import { BadRequestException, Injectable } from '@nestjs/common';
import { TgoTimerService } from './tgo-timer.service';
import { TgoRoundState } from '../common/enum/tgo/tgo-round-state.enum';
import { TgoGameState } from '../common/enum/tgo/tgo-game-state.enum';
import { TgoGateway } from './tgo.gateway';
import { TgoUserDataRepository } from './tgo-user-data.repository';
import { TgoStage } from '../common/enum/tgo/tgo-stage.enum';

const READY_DURATION = 3;
const CHOOSING_AND_ANSWERING_DURATION = 70;
const ATTACKING_AND_SHOWING_RESULT_DURATION = 30;

@Injectable()
export class TgoGameService {
  private gameState = TgoGameState.NOT_PLAYING;
  private roundState = TgoRoundState.WAITING;
  private countdown: number;

  constructor(
    private readonly timerService: TgoTimerService,
    private readonly gateway: TgoGateway,
    private readonly TgoUserDataRepository: TgoUserDataRepository,
  ) {}

  async startGame() {
    if (this.gameState !== TgoGameState.NOT_PLAYING) {
      throw new BadRequestException('Game already started');
    }

    await this.TgoUserDataRepository.deleteAll();
    this.countdown = 10;

    this.gameState = TgoGameState.PLAYING;
    void (async () => {
      await this.startRound();
    })();
  }

  stopGame() {
    if (this.gameState === TgoGameState.NOT_PLAYING) {
      throw new BadRequestException('Game not started');
    }

    this.gateway.emitGameEnded();
    this.endGame();
    this.timerService.stop();
  }

  pauseGame() {
    if (this.gameState === TgoGameState.NOT_PLAYING) {
      throw new BadRequestException('Game not started');
    }

    this.gateway.emitGamePaused();
    this.gameState = TgoGameState.PAUSED;
    this.timerService.pause();
  }

  resumeGame() {
    if (this.gameState !== TgoGameState.PAUSED) {
      throw new BadRequestException('Game not paused');
    }

    this.gateway.emitGameResumed();
    this.gameState = TgoGameState.PLAYING;
    void (async () => {
      await this.timerService.resume();
      switch (this.roundState) {
        case TgoRoundState.WAITING:
          await this.choosingAndAnsweringPhase();
          await this.attackingAndShowingResultPhase();
          break;
        case TgoRoundState.CHOOSING_AND_ANSWERING:
          await this.attackingAndShowingResultPhase();
          break;
      }

      this.countdown--;
      await this.startRound();
    })();
  }

  async startRound() {
    console.log('Starting round', this.countdown);

    if (this.countdown === 0) {
      this.gateway.emitGameEnded();
      this.endGame();
      return;
    }

    this.gateway.emitUpdateStage(TgoStage.WAITING);
    await this.timerService.start(READY_DURATION, (timeLeft) => this.gateway.emitReadyTimer(timeLeft));

    await this.choosingAndAnsweringPhase();
    await this.attackingAndShowingResultPhase();

    this.countdown--;
    await this.startRound();
  }

  async choosingAndAnsweringPhase() {
    this.gateway.emitUpdateStage(TgoStage.CHOOSING_AND_ANSWERING);
    this.roundState = TgoRoundState.CHOOSING_AND_ANSWERING;

    await this.timerService.start(CHOOSING_AND_ANSWERING_DURATION, (timeLeft) =>
      this.gateway.emitTimerUpdate(timeLeft),
    );
  }

  async attackingAndShowingResultPhase() {
    this.gateway.emitUpdateStage(TgoStage.ATTACKING_AND_SHOWING_RESULT);
    this.roundState = TgoRoundState.ATTACKING_AND_SHOWING_RESULT;

    await this.timerService.start(ATTACKING_AND_SHOWING_RESULT_DURATION, (timeLeft) =>
      this.gateway.emitTimerUpdate(timeLeft),
    );
  }

  endGame() {
    this.gameState = TgoGameState.NOT_PLAYING;
    this.roundState = TgoRoundState.WAITING;
  }

  getRoundState() {
    return this.roundState;
  }
}
