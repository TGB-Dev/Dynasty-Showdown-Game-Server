import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MchgRound } from '../schemas/mchg/mchgRound.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class MchgRoundRepository {
  constructor(@InjectModel(MchgRound.name) private readonly mchgRoundModel: Model<MchgRound>) {}

  create(round: any): Promise<MchgRound> {
    const newRound = new this.mchgRoundModel(round);
    return newRound.save();
  }

  update(roundId: string | mongoose.Types.ObjectId, round: Partial<MchgRound>): Promise<MchgRound | null> {
    return this.mchgRoundModel.findByIdAndUpdate(roundId, round, { new: true }).exec();
  }

  getAll(): Promise<MchgRound[]> {
    return this.mchgRoundModel.find().populate('questions').exec();
  }

  async getByOrder(order: number) {
    return (await this.mchgRoundModel.find().populate('questions').sort({ order: 1 }).exec())[order];
  }
}
