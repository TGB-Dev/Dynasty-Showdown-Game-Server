import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MchgMainQuestionQueue } from '../schemas/mchg/mchgMainQuestionQueue.schema';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class MchgMainQuestionQueueRepository {
  constructor(
    @InjectModel(MchgMainQuestionQueue.name) private readonly mchgMainAnswerQueueModel: Model<MchgMainQuestionQueue>,
  ) {}

  create(user: User) {
    const newItem = new this.mchgMainAnswerQueueModel({ user });

    return newItem.save();
  }

  findByUser(user: User) {
    return this.mchgMainAnswerQueueModel.findOne({ user: user }).exec();
  }

  deleteFirstCreated() {
    return this.mchgMainAnswerQueueModel.findOneAndDelete({}).sort({ created_at: 'asc' }).exec();
  }

  getAll() {
    return this.mchgMainAnswerQueueModel.find({}).sort({ created_at: 'asc' }).exec();
  }

  deleteAll() {
    return this.mchgMainAnswerQueueModel.deleteMany({}).exec();
  }

  async length() {
    return (await this.getAll()).length;
  }
}
