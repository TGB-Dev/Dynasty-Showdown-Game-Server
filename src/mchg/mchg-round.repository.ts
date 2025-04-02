import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MchgRound } from '../schemas/mchg/mchgRound.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class MchgRoundRepository {
  constructor(@InjectModel(MchgRound.name) private readonly mchgRoundModel: Model<MchgRound>) {}

  create(roundDto: any): Promise<MchgRound> {
    const newRound = new this.mchgRoundModel(roundDto);
    return newRound.save();
  }

  getAll(): Promise<MchgRound[]> {
    return this.mchgRoundModel.find().exec();
  }

  async getByOrder(order: number): Promise<MchgRound> {
    return (await this.mchgRoundModel.find().sort({ order: 1 }).exec())[order];
  }
}
