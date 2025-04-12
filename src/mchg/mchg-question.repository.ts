import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MchgQuestion } from '../schemas/mchg/mchgQuestion.schema';

@Injectable()
export class MchgQuestionRepository {
  constructor(@InjectModel(MchgQuestion.name) private readonly mchgQuestionModel: Model<MchgQuestion>) {}

  create(question: MchgQuestion): Promise<MchgQuestion> {
    const newQuestion = new this.mchgQuestionModel(question);
    return newQuestion.save();
  }

  createMany(questions: MchgQuestion[]): Promise<MchgQuestion[]> {
    return Promise.all(questions.map((question) => this.create(question)));
  }

  async findById(id: string | mongoose.Types.ObjectId) {
    return await this.mchgQuestionModel.findById(id).exec();
  }

  async updateSelected(id: string | mongoose.Types.ObjectId, selected: boolean): Promise<MchgQuestion | null> {
    return await this.mchgQuestionModel.findByIdAndUpdate(id, { selected }, { new: true, runValidators: true }).exec();
  }

  async updateSolved(id: string | mongoose.Types.ObjectId, solved: boolean): Promise<MchgQuestion | null> {
    return await this.mchgQuestionModel.findByIdAndUpdate(id, { solved }, { new: true, runValidators: true }).exec();
  }

  async getSolved() {
    return await this.mchgQuestionModel.find({ solved: true }).exec();
  }

  async getAll() {
    return await this.mchgQuestionModel.find({}).exec();
  }

  async reset() {
    await this.mchgQuestionModel.updateMany({}, { solved: false, selected: false }).exec();
  }
}
