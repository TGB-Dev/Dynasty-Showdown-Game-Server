import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MchgRound } from '../schemas/mchg/mchgRound.schema';
import { Model } from 'mongoose';

@Injectable()
export class MchgRepository {
  constructor(@InjectModel(MchgRound.name) private readonly mchgRoundModel: Model<MchgRound>) {}

  createRound(roundDto: any): Promise<MchgRound> {
    const newRound = new this.mchgRoundModel(roundDto);
    return newRound.save();
  }
}
