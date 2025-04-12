import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RokAttack } from '../schemas/rok/rokAttack.schema';
import { Model, ObjectId } from 'mongoose';
import { RokMatrixState } from '../schemas/rok/rokMatrixState.schema';
import { RokQuestion } from '../schemas/rok/rokQuestion.schema';
import { NewRokQuestionDto, UpdateRokQuestionDto } from '../dtos/rok.dto';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class RokRepository {
  constructor(
    @InjectModel(RokAttack.name) private readonly rokAttackModel: Model<RokAttack>,
    @InjectModel(RokMatrixState.name) private readonly rokMatrixModel: Model<RokMatrixState>,
    @InjectModel(RokQuestion.name) private readonly rokQuestionModel: Model<RokQuestion>,
    private readonly userRepository: UserRepository,
  ) {}

  private currentQuestionId: ObjectId | null = null;

  private readonly bfsDirections = [-1, +1, -9, +9];

  private async bfs(cityId: number, teamUsername: string) {
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
    await newQuestionModel.validate();
    return await newQuestionModel.save();
  }

  async getQuestions() {
    return await this.rokQuestionModel.find({}).exec();
  }

  async getQuestionById(id: string) {
    return await this.rokQuestionModel.findById(id).exec();
  }

  async updateQuestion(id: string, updates: UpdateRokQuestionDto) {
    const question = await this.getQuestionById(id);
    if (!question) {
      throw new NotFoundException('The question with specified ID was not found.');
    }

    question.set(updates);
    await question.validate();
    return await question.save();
  }

  async deleteQuestion(id: string) {
    await this.rokQuestionModel.findByIdAndDelete(id, { new: true }).exec();
  }

  async nextQuestion() {
    const question = await this.getRandomQuestion();
    this.currentQuestionId = question._id;
    return question;
  }

  async getCurrentQuestion() {
    if (!this.currentQuestionId) {
      throw new BadRequestException('No currently running question');
    }
    return await this.rokQuestionModel.findById(this.currentQuestionId).exec();
  }

  private async getRandomQuestion() {
    const fetchedQuestion = await this.rokQuestionModel
      .aggregate([
        {
          $match: { selected: false },
          $sample: { size: 1 },
        },
      ])
      .exec();

    if (!fetchedQuestion) {
      throw new NotFoundException('No more questions found.');
    }

    return (await this.rokQuestionModel
      .findOneAndUpdate(
        {
          // @ts-expect-error The aggregation pipeline doesn't recognize the document's type
          _id: fetchedQuestion._id,
        },
        { selected: true },
        { new: true },
      )
      .exec())!;
  }

  async getCurrentQuestionForTeam(round: number) {
    return await this.rokQuestionModel.findOne({ round }).exec();
  }

  async getAttacks() {
    return await this.rokAttackModel.find({}).exec();
  }

  async getAttackingTeams() {
    const teams = (await this.getAttacks()).map((value) => value.attackTeam);
    return [...new Set(teams)];
  }

  async selectCity(teamUsername: string, cityId: number) {
    const newAttack = new this.rokAttackModel({
      attackTeam: teamUsername,
      cityId: cityId,
    });

    await newAttack.save();
  }

  async deselectCity(teamUsername: string, cityId: number) {
    await this.rokAttackModel.findOneAndDelete({ cityId: cityId, attackTeam: teamUsername }).exec();
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
    const teams = await this.userRepository.getTeamUsernames();
    for (const team of teams) {
      const cities = await this.rokMatrixModel.find({ owner: team }).exec();
      for (const city of cities) {
        if (await this.bfs(city.cityId, team)) {
          points[team] += 100;
          break;
        }
      }
    }

    for (const [teamUsername, _points] of Object.entries(points)) {
      const teamId = (await this.userRepository.findUserByUsername(teamUsername))!._id!;
      // @ts-expect-error `ObjectId`s are the same but different (?)
      await this.userRepository.increaseScore(teamId, _points);
    }
  }

  async getMatrix() {
    return await this.rokMatrixModel.find({}).exec();
  }
}
