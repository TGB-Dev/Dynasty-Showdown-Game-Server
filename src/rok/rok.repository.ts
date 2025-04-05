import { ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RokAttack } from '../schemas/rok/rokAttack.schema';
import { Model } from 'mongoose';
import { RokMatrixState } from '../schemas/rok/rokMatrixState.schema';
import { RokQuestion } from '../schemas/rok/rokQuestion.schema';
import { NewRokQuestionDto } from '../dtos/rok/newRokQuestion.dto';
import { UpdateRokQuestionDto } from '../dtos/rok/updateRokQuestion.dto';
import { UserRepository } from '../user/user.repository';
import { RokService } from './rok.service';
import { RokStage } from '../common/enum/rok/rokStage.enum';
import { RokGateway } from './rok.gateway';

@Injectable()
export class RokRepository {
  constructor(
    @InjectModel(RokAttack.name) private readonly rokAttackModel: Model<RokAttack>,
    @InjectModel(RokMatrixState.name) private readonly rokMatrixModel: Model<RokMatrixState>,
    @InjectModel(RokQuestion.name) private readonly rokQuestionModel: Model<RokQuestion>,
    @Inject(forwardRef(() => RokService))
    private readonly rokService: RokService,
    @Inject(forwardRef(() => RokGateway))
    private readonly rokGateway: RokGateway,
    private readonly userRepository: UserRepository,
  ) {}

  private readonly bfsDirections = [-1, +1, -9, +9];

  async bfs(cityId: number, teamUsername: string) {
    const matrix = await this.getMatrix();

    const q = [{ cityId: cityId, cnt: 1 }];
    while (q.length > 0) {
      const curr = q.shift()!;

      if (curr.cnt === 4) {
        return true;
      }

      for (const direction of this.bfsDirections) {
        const newCityId = curr.cityId + direction;
        if (0 <= newCityId && newCityId < 81 && matrix.find((c) => c.cityId === newCityId)!.owner === teamUsername) {
          q.push({ cityId: newCityId, cnt: curr.cnt + 1 });
        }
      }
    }

    return false;
  }

  async createQuestion(newQuestion: NewRokQuestionDto) {
    const newQuestionModel = new this.rokQuestionModel(newQuestion);
    return await newQuestionModel.save();
  }

  async getQuestions() {
    return await this.rokQuestionModel.find({}).exec();
  }

  async getQuestionById(id: string) {
    return await this.rokQuestionModel.findById(id).exec();
  }

  async updateQuestion(id: string, updates: UpdateRokQuestionDto) {
    return await this.rokQuestionModel.findOneAndUpdate({ _id: id }, updates, { new: true }).exec();
  }

  async deleteQuestion(id: string) {
    await this.rokQuestionModel.findByIdAndDelete(id, { new: true }).exec();
  }

  async getRandomQuestion() {
    let ok = false;
    let selectedQuestion: RokQuestion | null = null;
    while (!ok) {
      const fetchedQuestion = await this.rokQuestionModel.aggregate([{ $sample: { size: 1 } }]).exec();
      selectedQuestion = await this.rokQuestionModel
        .findOneAndUpdate(
          {
            // @ts-expect-error The aggregation pipeline doesn't recognize the document's type
            _id: fetchedQuestion._id,
            selected: false,
          },
          { selected: true },
          { new: true },
        )
        .exec();
      ok = selectedQuestion !== null;
    }

    return selectedQuestion!;
  }

  async getAttacks() {
    return await this.rokAttackModel.find({}).exec();
  }

  async getAttackingTeams() {
    const teams = (await this.getAttacks()).map((value) => value.attackTeam);
    return [...new Set(teams)];
  }

  async createAttack(teamUsername: string, cityId: number) {
    if (!(this.rokService.timerIsRunning && this.rokService.currentStage === RokStage.ATTACK)) {
      return;
    }

    const newAttack = new this.rokAttackModel({
      attackTeam: teamUsername,
      cityId: cityId,
    });

    await newAttack.save();
    await this.rokGateway.updateAttacks();
  }

  async deleteAttack(teamUsername: string, cityId: number) {
    if (!(this.rokService.timerIsRunning && this.rokService.currentStage === RokStage.ATTACK)) {
      return;
    }

    await this.rokAttackModel.findOneAndDelete({ cityId: cityId, attackTeam: teamUsername }).exec();
    await this.rokGateway.updateAttacks();
  }

  // Delete attacks from `teamUsername`
  async deleteAttacksOnIncorrectAnswer(teamUsername: string) {
    await this.rokAttackModel.deleteMany({ attackTeam: teamUsername }).exec();
  }

  // Delete attacks from other teams to cities owned by `teamUsername`
  async defendOnCorrectAnswer(teamUsername: string) {
    const cities = await this.rokMatrixModel.find({ owner: teamUsername }).exec();
    for (const city of cities) {
      await this.rokAttackModel.findOneAndDelete({ cityId: city.cityId }).exec();
    }
  }

  // Mark attacks as answered (success)
  async markAttackAsSucceeded(teamUsername: string) {
    await this.rokAttackModel.findOneAndUpdate({ attackTeam: teamUsername }, { answered: true }).exec();
  }

  async updateOwnerships() {
    // Remove unanswered attacks
    await this.rokAttackModel.deleteMany({ answered: false }).exec();

    const attacks = await this.rokAttackModel.find({}).exec();
    for (const attack of attacks) {
      const updatedCity = await this.rokMatrixModel
        .findOneAndUpdate({ cityId: attack.cityId }, { owner: attack.attackTeam }, { new: true })
        .exec();
      if (!updatedCity) {
        throw new ConflictException(
          `Failed to update the ownership of city ${attack.cityId} to "${attack.attackTeam}"`,
        );
      }
    }
  }

  async recalculatePoints() {
    const cities = await this.rokMatrixModel.find().exec();
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
    const teams = await this.userRepository.getTeams();
    for (const team of teams) {
      const cities = await this.rokMatrixModel.find({ owner: team }).exec();
      for (const city of cities) {
        if (await this.bfs(city.cityId, team)) {
          points[team] += 100;
          break;
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [k, v] of Object.entries(points)) {
      // TODO: Update the points of teamName `k` an amount of `v`
    }
  }

  async getMatrix() {
    return await this.rokMatrixModel.find({}).exec();
  }
}
