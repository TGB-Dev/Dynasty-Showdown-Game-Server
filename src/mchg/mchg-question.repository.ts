import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MchgQuestion } from '../schemas/mchg/mchgQuestion.schema';

@Injectable()
export class MchgQuestionRepository {
  constructor(@InjectModel(MchgQuestion.name) private readonly mchgQuestionModel: Model<MchgQuestion>) {}

  create(question: MchgQuestion): Promise<MchgQuestion> {
    const newQuestion = new this.mchgQuestionModel(question);
    return newQuestion.save();
  }

  async getSolvedQuestions() {
    return await this.mchgQuestionModel.find({ solved: true }).exec();
  }
}
