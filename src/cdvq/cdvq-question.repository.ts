import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CdvqQuestion } from '../schemas/cdvq/cdvq-question.schema';
import { Model } from 'mongoose';
import { QuestionDto } from '../dtos/cdvq.dto';

@Injectable()
export class CdvqQuestionRepository {
  constructor(@InjectModel(CdvqQuestion.name) private readonly cdvqQuestionModel: Model<CdvqQuestion>) {}

  create(object: any) {
    const question = new this.cdvqQuestionModel(object);
    return question.save();
  }

  delete(id: string) {
    return this.cdvqQuestionModel.findByIdAndDelete(id).exec();
  }

  update(id: string, questionDto: QuestionDto) {
    return this.cdvqQuestionModel.findByIdAndUpdate(id, questionDto).exec();
  }

  getAll(): Promise<CdvqQuestion[]> {
    return this.cdvqQuestionModel.find().exec();
  }

  getFirstWaiting() {
    return this.cdvqQuestionModel.findOne({ status: 'waiting' }).exec();
  }

  updateStatus(id: string | CdvqQuestion, status: string) {
    return this.cdvqQuestionModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();
  }
}
