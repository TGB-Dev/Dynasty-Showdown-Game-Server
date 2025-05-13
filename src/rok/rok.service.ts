import { BadRequestException, Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { RokRepository } from './rok.repository';
import { RokGateway } from './rok.gateway';
import { NewRokQuestionDto, RokAnswerQuestionDto, UpdateRokQuestionDto } from '../dtos/rok.dto';
import { RokStage } from '../common/enum/rok/rokStage.enum';
import { RokTimerService } from './rok-timer.service';
import { GameRepository } from '../game/game.repository';
import { Room } from '../common/enum/room.enum';
import { UserRepository } from '../user/user.repository';

const CHOOSE_CITY_TIMEOUT = 20;
const ATTACK_TIMEOUT = 20;
const DEFEND_TIMEOUT = 20;
const UPDATE_RESULTS_TIMEOUT = 20;
const BFS_DIRECTIONS = [-1, +1, -9, +9];

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
    private readonly gameRepository: GameRepository,
  ) {}

  async runGame() {
    await this.gameRepository.setStartedGame(Room.ROK);
    void (async () => {
      await this.timerService.start(3, (rem) => this.rokGateway.updateRunGameTimer(rem));
      void this.runRound();
    })();
  }

  pauseGame() {
    void this.timerService.pause();

    // Save states
    this.lastStage = this.currentStage;
    this.currentStage = RokStage.PAUSED;
    this.rokGateway.pauseGame();
  }

  resumeGame() {
    // Recover states
    this.currentStage = this.lastStage;
    this.lastStage = RokStage.PAUSED;

    void this.timerService.resume();
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
      await this.endGame();
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
      await this.nextQuestion(this.currentRound);
      this.rokGateway.updateStage(this.currentStage);

      const attackingTeams = await this.getAttackingTeams();
      this.sendGetQuestionSignalToTeams(attackingTeams);

      await this.timerService.start(ATTACK_TIMEOUT, (rem) => this.rokGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = RokStage.DEFEND;
      await this.runRound();
    }

    if (this.currentStage === RokStage.DEFEND) {
      await this.nextQuestion(this.currentRound);
      this.rokGateway.updateStage(this.currentStage);

      // Send the defending question to all teams
      this.sendGetQuestionSignalToTeams(await this.getAllTeams());

      await this.timerService.start(DEFEND_TIMEOUT, (rem) => this.rokGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = RokStage.UPDATE_RESULTS;
      await this.runRound();
    }

    if (this.currentStage === RokStage.UPDATE_RESULTS) {
      await this.updateOwnerships();
      await this.recalculatePoints();
      this.rokGateway.updateStage(this.currentStage);

      this.rokGateway.updateMatrix();

      await this.timerService.start(UPDATE_RESULTS_TIMEOUT, (rem) => this.rokGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = RokStage.CHOOSE_CITY;
      this.currentRound++;
      await this.runRound();
    }
  }

  async checkInAttackingTeams(username: string) {
    const teams = await this.getAttackingTeams();
    if (!teams.includes(username)) {
      throw new BadRequestException('You are not in the attacking teams.');
    }
    return true;
  }

  async checkInDefendingTeams(username: string) {
    const teams = await this.getAttacks();
    const defendingTeams = await Promise.all(
      teams.map(async (team) => {
        return await this.getOwnershipOfCity(team.cityId);
      }),
    );
    if (!defendingTeams.includes(username)) {
      throw new BadRequestException('You are not in the defending teams.');
    }
    return true;
  }

  async endGame() {
    this.rokGateway.endGame();
    this.rokGateway.leaveRoom();
    this.timerService.stop();
    await this.gameRepository.unsetRunningGame(Room.ROK);
    await this.gameRepository.unsetStartedGame(Room.ROK);
  }

  async answerQuestion(username: string, rokAnswerQuestionDto: RokAnswerQuestionDto) {
    const question = await this.getCurrentQuestion();
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (
      !this.timerService.timerIsRunning() ||
      (this.currentStage !== RokStage.ATTACK && this.currentStage !== RokStage.DEFEND)
    ) {
      throw new BadRequestException('Question answering stage ended');
    }

    if (this.currentStage === RokStage.ATTACK) {
      if (question.isMultiple) {
        if (question.correctChoiceIndex !== rokAnswerQuestionDto.choiceIndex) {
          await this.deleteAttacksOnIncorrectAnswer(username);
          return false;
        } else {
          await this.markAttackAsSucceeded(username);
          return true;
        }
      } else {
        if (question.answer !== rokAnswerQuestionDto.answer) {
          await this.deleteAttacksOnIncorrectAnswer(username);
          return false;
        } else {
          await this.markAttackAsSucceeded(username);
          return true;
        }
      }
    } else if (this.currentStage === RokStage.DEFEND) {
      if (question.isMultiple) {
        if (question.correctChoiceIndex === rokAnswerQuestionDto.choiceIndex) {
          await this.defendOnCorrectAnswer(username);
          return true;
        }
      } else {
        if (question.answer === rokAnswerQuestionDto.answer) {
          await this.defendOnCorrectAnswer(username);
          return true;
        }
      }
    }

    return false;
  }

  async recalculatePoints() {
    const cities = await this.rokRepository.getMatrix();
    const points = {};
    cities.forEach((c) => {
      if (c.owner) {
        if (!points[c.owner]) {
          points[c.owner] = 0;
        }
        points[c.owner] += c.points;
      }
    });

    // Bonus points if there is any area of 4 adjacent cities
    const teams = await this.userRepository.getTeamUsernames();
    for (const team of teams) {
      const cities = await this.getCitiesByOwner(team);
      for (const city of cities) {
        if (await this.bfs(city.cityId, team)) {
          points[team] += 100;
          break;
        }
      }
    }

    for (const [teamUsername, _points] of Object.entries(points)) {
      const teamId = (await this.userRepository.findUserByUsername(teamUsername))!._id;
      // @ts-expect-error `ObjectId`s are the same but different (?)
      await this.userRepository.increaseScore(teamId, _points);
    }
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

  async getCurrentQuestion() {
    return await this.rokRepository.getCurrentQuestion();
  }

  async updateQuestion(id: string, updates: UpdateRokQuestionDto) {
    return await this.rokRepository.updateQuestion(id, updates);
  }

  async deleteQuestion(id: string) {
    return await this.rokRepository.deleteQuestion(id);
  }

  async nextQuestion(currentRound: number) {
    return await this.rokRepository.nextQuestion(currentRound);
  }

  async getCitiesByOwner(teamUsername: string) {
    return await this.rokRepository.getCitiesByOwner(teamUsername);
  }

  async getOwnershipOfCity(cityId: number) {
    return await this.rokRepository.getOwnershipOfCity(cityId);
  }

  async getMatrix() {
    return await this.rokRepository.getMatrix();
  }

  async getAttacks() {
    return await this.rokRepository.getAttacks();
  }

  async deleteAttacksOnIncorrectAnswer(teamUsername: string) {
    await this.rokRepository.deleteAttacksOnIncorrectAnswer(teamUsername);
  }

  async markAttackAsSucceeded(teamUsername: string) {
    await this.rokRepository.markAttackAsSucceeded(teamUsername);
  }

  async selectCity(teamUsername: string, cityId: number) {
    if (!(this.timerService.timerIsRunning() && this.currentStage === RokStage.CHOOSE_CITY)) {
      throw new BadRequestException('City choosing stage ended.');
    }

    await this.rokRepository.selectCity(teamUsername, cityId);
    this.rokGateway.updateAttacks();
  }

  async deselectCity(teamUsername: string, cityId: number) {
    if (!(this.timerService.timerIsRunning() && this.currentStage === RokStage.CHOOSE_CITY)) {
      throw new BadRequestException('City choosing stage ended.');
    }

    await this.rokRepository.deselectCity(teamUsername, cityId);
    this.rokGateway.updateAttacks();
  }

  async defendOnCorrectAnswer(teamUsername: string) {
    if (!(this.timerService.timerIsRunning() && this.currentStage === RokStage.DEFEND)) {
      throw new BadRequestException('Defending stage ended.');
    }

    await this.rokRepository.defendOnCorrectAnswer(teamUsername);
  }

  async getAttackingTeams() {
    return await this.rokRepository.getAttackingTeams();
  }

  async deleteUnansweredAttacks() {
    await this.rokRepository.deleteUnansweredAttacks();
  }

  async updateOwnershipOfCity(cityId: number, teamUsername: string) {
    await this.rokRepository.updateOwnershipOfCity(cityId, teamUsername);
  }

  async updateOwnerships() {
    await this.deleteUnansweredAttacks();

    const attacks = await this.getAttacks();
    for (const attack of attacks) {
      await this.updateOwnershipOfCity(attack.cityId, attack.attackTeam);
    }
  }

  async getAllTeams() {
    return await this.userRepository.getTeamUsernames();
  }

  sendGetQuestionSignalToTeams(teams: string[]) {
    for (const team of teams) {
      this.rokGateway.sendGetQuestionSignal(team);
    }
  }

  getCurrentStage() {
    return this.currentStage;
  }

  onModuleDestroy() {
    this.timerService.stop();
  }

  private async bfs(cityId: number, teamUsername: string) {
    const matrix = await this.getMatrix();

    const q = [{ cityId: cityId, cnt: 1 }];
    while (q.length > 0) {
      const curr = q.shift()!;

      if (curr.cnt === 4) {
        return true;
      }

      for (const direction of BFS_DIRECTIONS) {
        const newCityId = curr.cityId + direction;
        if (0 <= newCityId && newCityId < 81 && matrix.find((c) => c.cityId === newCityId)!.owner === teamUsername) {
          q.push({ cityId: newCityId, cnt: curr.cnt + 1 });
        }
      }
    }

    return false;
  }
}
