import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RokAttack } from '../schemas/rok/rokAttack.schema';
import mongoose, { Model } from 'mongoose';
import { RokMatrixState } from '../schemas/rok/rokMatrixState.schema';
import { RokQuestion } from '../schemas/rok/rokQuestion.schema';
import { NewRokQuestionDto, UpdateRokQuestionDto } from '../dtos/rok.dto';

@Injectable()
export class RokRepository {
  private currentQuestionId: mongoose.Types.ObjectId | null = null;

  constructor(
    @InjectModel(RokAttack.name) private readonly rokAttackModel: Model<RokAttack>,
    @InjectModel(RokMatrixState.name) private readonly rokMatrixModel: Model<RokMatrixState>,
    @InjectModel(RokQuestion.name) private readonly rokQuestionModel: Model<RokQuestion>,
  ) {}

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

  async getOwnershipOfCity(cityId: number) {
    const city = await this.rokMatrixModel.findOne({ cityId }).exec();
    if (!city) {
      throw new NotFoundException('City not found');
    }
    return city.owner;
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

  async nextQuestion(currentRound: number) {
    const question = await this.getRandomQuestion(currentRound);
    this.currentQuestionId = question._id;
    return question;
  }

  async getCurrentQuestion() {
    if (!this.currentQuestionId) {
      throw new BadRequestException('No currently running question');
    }
    return await this.rokQuestionModel.findById(this.currentQuestionId).exec();
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

  async deleteUnansweredAttacks() {
    await this.rokAttackModel.deleteMany({ answered: false }).exec();
  }

  async updateOwnershipOfCity(cityId: number, newTeamUsername: string) {
    const updatedCity = await this.rokMatrixModel
      .findOneAndUpdate({ cityId: cityId }, { owner: newTeamUsername }, { new: true })
      .exec();
    if (!updatedCity) {
      throw new ConflictException(`Failed to update the ownership of city ${cityId} to "${newTeamUsername}"`);
    }
  }

  async getMatrix() {
    return await this.rokMatrixModel.find({}).exec();
  }

  async getCitiesByOwner(teamUsername: string) {
    return await this.rokMatrixModel.find({ owner: teamUsername }).exec();
  }

  private async getRandomQuestion(currentRound: number) {
    const questions = await this.rokQuestionModel
      .find({
        selected: false,
      })
      .exec();

    const randomIndex = Math.floor(Math.random() * questions.length);
    const randomQuestion = questions[randomIndex];

    if (!randomQuestion) {
      throw new NotFoundException('No questions available');
    }

    randomQuestion.selected = true;
    randomQuestion.round = currentRound;

    await randomQuestion.save();

    return randomQuestion;
  }
}
