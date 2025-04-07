import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { RokRepository } from './rok.repository';
import { RokGateway } from './rok.gateway';
import { RokAnswerQuestionDto } from '../dtos/rok/rokAnswerQuestion.dto';
import { RokStage } from '../common/enum/rok/rokStage.enum';
import { UserRepository } from '../user/user.repository';
import { NewRokQuestionDto } from '../dtos/rok/newRokQuestion.dto';
import { UpdateRokQuestionDto } from '../dtos/rok/updateRokQuestion.dto';

@Injectable()
export class RokService implements OnModuleDestroy {
  private remainingTime = 0;
  private interval: NodeJS.Timeout | null = null;
  private lastStage: RokStage = RokStage.PAUSED;
  private roundCount: number = 10;
  private currentRound: number = 0;
  timerIsRunning: boolean = false;
  currentStage: RokStage = RokStage.CHOOSE_CITY;

  constructor(
    private readonly rokRepository: RokRepository,
    private readonly rokGateway: RokGateway,
    private readonly userRepository: UserRepository,
  ) {}

  async runGame() {
    await this.startTimer(3, (rem) => this.rokGateway.updateRunGameTimer(rem));
    await this.runRound();
  }

  pauseGame() {
    this.lastStage = this.currentStage;
    this.currentStage = RokStage.PAUSED;
    this.rokGateway.pauseGame();
  }

  async resumeGame() {
    this.currentStage = this.lastStage;
    this.lastStage = RokStage.PAUSED;
    this.rokGateway.resumeGame();
    await this.runRound();
  }

  async runRound() {
    if (this.currentRound >= this.roundCount) {
      return;
    }

    if (this.currentStage === RokStage.PAUSED) {
      return;
    }

    this.rokGateway.updateRound(this.currentRound);

    if (this.currentStage === RokStage.CHOOSE_CITY) {
      this.rokGateway.updateStage(this.currentStage);
      await this.startTimer(20, (rem) => this.rokGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = RokStage.ATTACK;
      await this.runRound();
    }

    if (this.currentStage === RokStage.ATTACK) {
      this.rokGateway.updateStage(this.currentStage);
      const attackingTeams = await this.rokRepository.getAttackingTeams();
      await this.sendQuestions(attackingTeams);
      await this.startTimer(40, (rem) => this.rokGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = RokStage.DEFEND;
      await this.runRound();
    }

    if (this.currentStage === RokStage.DEFEND) {
      this.rokGateway.updateStage(this.currentStage);
      const teams = await this.userRepository.getTeams();
      await this.sendQuestions(teams);
      await this.startTimer(40, (rem) => this.rokGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = RokStage.UPDATE_RESULTS;
      await this.runRound();
    }

    if (this.currentStage === RokStage.UPDATE_RESULTS) {
      await this.rokRepository.updateOwnerships();
      await this.rokRepository.recalculatePoints();
      this.rokGateway.updateStage(this.currentStage);

      const matrix = await this.rokRepository.getMatrix();
      this.rokGateway.updateMatrix(matrix);

      await this.startTimer(40, (rem) => this.rokGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = RokStage.CHOOSE_CITY;
      this.currentRound++;
      await this.runRound();
    }
  }

  async startTimer(durationInSeconds: number, broadcastFunction: (remainingTimeInSeconds: number) => void) {
    if (this.timerIsRunning) {
      return;
    }

    this.remainingTime = durationInSeconds;
    this.timerIsRunning = true;

    return new Promise<void>((resolve) => {
      this.interval = setInterval(() => {
        if (this.remainingTime <= 0) {
          this.stopTimer();
          resolve();
          return;
        }

        this.remainingTime--;
        broadcastFunction(this.remainingTime);
      }, 1000);
    });
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.timerIsRunning = false;
  }

  async answerQuestion(questionId: string, teamUsername: string, dto: RokAnswerQuestionDto) {
    const question = await this.rokRepository.getQuestionById(questionId);
    if (!question) {
      throw new NotFoundException();
    }

    if (!this.timerIsRunning) {
      return;
    }

    if (this.currentStage !== RokStage.ATTACK && this.currentStage !== RokStage.DEFEND) {
      return;
    }

    if (this.currentStage === RokStage.ATTACK) {
      if (question.isMultiple) {
        if (question.correctChoiceIndex !== dto.choiceIndex) {
          await this.rokRepository.deleteAttacksOnIncorrectAnswer(teamUsername);
        } else {
          await this.rokRepository.markAttackAsSucceeded(teamUsername);
        }
      } else {
        if (question.answer !== dto.answer) {
          await this.rokRepository.deleteAttacksOnIncorrectAnswer(teamUsername);
        } else {
          await this.rokRepository.markAttackAsSucceeded(teamUsername);
        }
      }
    } else if (this.currentStage === RokStage.DEFEND) {
      if (question.isMultiple) {
        if (question.correctChoiceIndex === dto.choiceIndex) {
          await this.rokRepository.defendOnCorrectAnswer(teamUsername);
        }
      } else {
        if (question.answer === dto.answer) {
          await this.rokRepository.defendOnCorrectAnswer(teamUsername);
        }
      }
    }
  }

  async sendQuestions(teams: string[]) {
    for (const team of teams) {
      const question = await this.rokRepository.getRandomQuestion();
      this.rokGateway.sendQuestion(team, question);
    }
  }

  async createAttack(teamUsername: string, cityId: number) {
    if (!(this.timerIsRunning && this.currentStage === RokStage.ATTACK)) {
      return;
    }

    await this.rokRepository.createAttack(teamUsername, cityId);
    const updatedAttacks = await this.rokRepository.getAttacks();
    this.rokGateway.updateAttacks(updatedAttacks);
  }

  async deleteAttack(teamUsername: string, cityId: number) {
    if (!(this.timerIsRunning && this.currentStage === RokStage.ATTACK)) {
      return;
    }

    await this.rokRepository.deleteAttack(teamUsername, cityId);
    const updatedAttacks = await this.rokRepository.getAttacks();
    this.rokGateway.updateAttacks(updatedAttacks);
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

  onModuleDestroy() {
    this.stopTimer();
  }
}
