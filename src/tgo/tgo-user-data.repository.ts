import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TgoUserData } from '../schemas/tgo/tgo-user-data.schema';
import { Model } from 'mongoose';

@Injectable()
export class TgoUserDataRepository {
  constructor(@InjectModel(TgoUserData.name) private readonly tgoUserDataModel: Model<TgoUserData>) {}

  create(object: any) {
    const userData = new this.tgoUserDataModel(object);
    return userData.save();
  }

  deleteAll() {
    return this.tgoUserDataModel.deleteMany({}).exec();
  }

  findAll() {
    return this.tgoUserDataModel.find({}).exec();
  }

  findByUsername(username: string) {
    return this.tgoUserDataModel.findOne({ username }).exec();
  }

  addChosenQuestion(username: string, questionId: string) {
    return this.tgoUserDataModel.findOneAndUpdate({ username }, { $push: { chosenQuestions: questionId } }).exec();
  }

  setCurrentQuestions(username: string, questions: CurrentQuestion[]) {
    return this.tgoUserDataModel.findOneAndUpdate({ username }, { $set: { currentQuestions: questions } });
  }

  setCurrentRound(username: string, round: number) {
    return this.tgoUserDataModel.findOneAndUpdate({ username }, { $set: { round } }).exec();
  }
}
