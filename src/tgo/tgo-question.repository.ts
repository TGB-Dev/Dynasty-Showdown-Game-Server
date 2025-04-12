import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TgoQuestion } from '../schemas/tgo/tgo-question.schema';
import { Model } from 'mongoose';
import { QuestionDto } from '../dtos/tgo.dto';

@Injectable()
export class TgoQuestionRepository {
  constructor(@InjectModel(TgoQuestion.name) private readonly tgoQuestionModel: Model<TgoQuestion>) {}

  create(object: any) {
    const question = new this.tgoQuestionModel(object);
    return question.save();
  }

  delete(id: string) {
    return this.tgoQuestionModel.findByIdAndDelete(id).exec();
  }

  update(id: string, questionDto: QuestionDto) {
    return this.tgoQuestionModel.findByIdAndUpdate(id, questionDto).exec();
  }

  findAll() {
    return this.tgoQuestionModel.find({}).exec();
  }

  findById(id: string) {
    return this.tgoQuestionModel.findById(id).exec();
  }
}
