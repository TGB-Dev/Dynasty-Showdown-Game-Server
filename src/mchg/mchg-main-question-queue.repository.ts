import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MchgMainQuestionQueue } from '../schemas/mchg/mchgMainQuestionQueue.schema';
import { Model } from 'mongoose';

@Injectable()
export class MchgMainQuestionQueueRepository {
  constructor(
    @InjectModel(MchgMainQuestionQueue.name) private readonly mchgMainAnswerQueueModel: Model<MchgMainQuestionQueue>,
  ) {}

  async enqueue(teamUsername: string) {
    const newItem = new this.mchgMainAnswerQueueModel({
      teamUsername,
      timestamp: Date.now(),
    });

    await newItem.save();
  }

  async dequeue() {
    const queue = await this.getAll();
    return queue.length > 0 ? queue[0] : null;
  }

  async getAll() {
    return await this.mchgMainAnswerQueueModel.find({}).sort({ timestamp: 'asc' }).exec();
  }

  async deleteAll() {
    return await this.mchgMainAnswerQueueModel.deleteMany({}).exec();
  }

  async length() {
    return (await this.getAll()).length;
  }
}
