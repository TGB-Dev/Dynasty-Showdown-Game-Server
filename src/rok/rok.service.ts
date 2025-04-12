import { BadRequestException, Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { RokRepository } from './rok.repository';
import { RokGateway } from './rok.gateway';
import { NewRokQuestionDto, RokAnswerQuestionDto, UpdateRokQuestionDto } from '../dtos/rok.dto';
import { RokStage } from '../common/enum/rok/rokStage.enum';
import { UserRepository } from '../user/user.repository';
import { RokTimerService } from './rok-timer.service';

const CHOOSE_CITY_TIMEOUT = 20;
const ATTACK_TIMEOUT = 40;
const DEFEND_TIMEOUT = 40;
const UPDATE_RESULTS_TIMEOUT = 40;

@Injectable()
export class RokService implements OnModuleDestroy {
  private lastStage: RokStage = RokStage.PAUSED;
  private currentStage: RokStage = RokStage.CHOOSE_CITY;

  private roundCount: number = 10;
  private currentRound: number = 0;

  constructor(
    private readonly timerService: RokTimerService,
    private readonly rokRepository: RokRepository,
    private readonly rokGateway: RokGateway,
    private readonly userRepository: UserRepository,
  ) {}

  runGame() {
    void (async () => {
      await this.timerService.start(3, (rem) => this.rokGateway.updateRunGameTimer(rem));
      void this.runRound();
    })();
  }

  pauseGame() {
    void this.timerService.pause();
    this.lastStage = this.currentStage;
    this.currentStage = RokStage.PAUSED;
    this.rokGateway.pauseGame();
  }

  resumeGame() {
    void this.timerService.resume();
    this.currentStage = this.lastStage;
    this.lastStage = RokStage.PAUSED;
    this.rokGateway.resumeGame();
    void this.runRound();
  }

  increaseRoundCount() {
    this.roundCount++;
  }

  decreaseRoundCount() {
    this.roundCount--;
  }

  getRoundCount() {
    return this.roundCount;
  }

  async runRound() {
    if (this.currentRound >= this.roundCount) {
      this.rokGateway.endGame();
    }

    if (this.currentStage === RokStage.PAUSED) {
      return;
    }

    this.rokGateway.updateRound(this.currentRound);

    if (this.currentStage === RokStage.CHOOSE_CITY) {
      this.rokGateway.updateStage(this.currentStage);
      await this.timerService.start(CHOOSE_CITY_TIMEOUT, (rem) => this.rokGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = RokStage.ATTACK;
      await this.runRound();
    }

    if (this.currentStage === RokStage.ATTACK) {
      this.rokGateway.updateStage(this.currentStage);
      const attackingTeams = await this.rokRepository.getAttackingTeams();
      this.sendGetQuestionSignal(attackingTeams);
      await this.timerService.start(ATTACK_TIMEOUT, (rem) => this.rokGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = RokStage.DEFEND;
      await this.runRound();
    }

    if (this.currentStage === RokStage.DEFEND) {
      this.rokGateway.updateStage(this.currentStage);
      const teams = await this.userRepository.getTeamUsernames();
      this.sendGetQuestionSignal(teams);
      await this.timerService.start(DEFEND_TIMEOUT, (rem) => this.rokGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = RokStage.UPDATE_RESULTS;
      await this.runRound();
    }

    if (this.currentStage === RokStage.UPDATE_RESULTS) {
      await this.rokRepository.updateOwnerships();
      await this.rokRepository.recalculatePoints();
      this.rokGateway.updateStage(this.currentStage);

      this.rokGateway.updateMatrix();

      await this.timerService.start(UPDATE_RESULTS_TIMEOUT, (rem) => this.rokGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = RokStage.CHOOSE_CITY;
      this.currentRound++;
      await this.runRound();
    }
  }

  async answerQuestion(questionId: string, teamUsername: string, dto: RokAnswerQuestionDto) {
    const question = await this.rokRepository.getQuestionById(questionId);
    if (!question) {
      throw new NotFoundException();
    }

    if (!this.timerService.timerIsRunning()) {
      return false;
    }

    if (this.currentStage !== RokStage.ATTACK && this.currentStage !== RokStage.DEFEND) {
      return false;
    }

    if (this.currentStage === RokStage.ATTACK) {
      if (question.isMultiple) {
        if (question.correctChoiceIndex !== dto.choiceIndex) {
          await this.rokRepository.deleteAttacksOnIncorrectAnswer(teamUsername);
          return false;
        } else {
          await this.rokRepository.markAttackAsSucceeded(teamUsername);
          return true;
        }
      } else {
        if (question.answer !== dto.answer) {
          await this.rokRepository.deleteAttacksOnIncorrectAnswer(teamUsername);
          return false;
        } else {
          await this.rokRepository.markAttackAsSucceeded(teamUsername);
          return true;
        }
      }
    } else if (this.currentStage === RokStage.DEFEND) {
      if (question.isMultiple) {
        if (question.correctChoiceIndex === dto.choiceIndex) {
          await this.rokRepository.defendOnCorrectAnswer(teamUsername);
          return true;
        }
      } else {
        if (question.answer === dto.answer) {
          await this.rokRepository.defendOnCorrectAnswer(teamUsername);
          return true;
        }
      }
    }

    return false;
  }

  async nextQuestion() {
    return await this.rokRepository.nextQuestion();
  }

  async getCurrentQuestion() {
    return await this.rokRepository.getCurrentQuestion();
  }

  sendGetQuestionSignal(teams: string[]) {
    for (const team of teams) {
      this.rokGateway.sendQuestion(team);
    }
  }

  async selectCity(teamUsername: string, cityId: number) {
    if (!(this.timerService.timerIsRunning() && this.currentStage === RokStage.ATTACK)) {
      throw new BadRequestException('Attack stage ended.');
    }

    await this.rokRepository.selectCity(teamUsername, cityId);
    this.rokGateway.updateAttacks();
  }

  async deselectCity(teamUsername: string, cityId: number) {
    if (!(this.timerService.timerIsRunning() && this.currentStage === RokStage.ATTACK)) {
      throw new BadRequestException('Attack stage ended.');
    }

    await this.rokRepository.deselectCity(teamUsername, cityId);
    this.rokGateway.updateAttacks();
  }

  async createQuestion(newQuestion: NewRokQuestionDto) {
    await this.rokRepository.createQuestion(newQuestion);
  }

  async getQuestions() {
    return await this.rokRepository.getQuestions();
  }

  async getQuestionById(id: string) {
    return await this.rokRepository.getQuestionById(id);
  }

  async updateQuestion(id: string, updates: UpdateRokQuestionDto) {
    return await this.rokRepository.updateQuestion(id, updates);
  }

  async deleteQuestion(id: string) {
    return await this.rokRepository.deleteQuestion(id);
  }

  async getMatrix() {
    return await this.rokRepository.getMatrix();
  }

  async getAttacks() {
    return await this.rokRepository.getAttacks();
  }

  getCurrentStage() {
    return this.currentStage;
  }

  onModuleDestroy() {
    this.timerService.stop();
  }
}
