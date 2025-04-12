import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TgoSubmission } from '../schemas/tgo/tgo-submission.schema';
import { Model } from 'mongoose';

@Injectable()
export class TgoSubmissionRepository {
  constructor(@InjectModel(TgoSubmission.name) private readonly tgoSubmissionModel: Model<TgoSubmission>) {}

  create(object: any) {
    const submission = new this.tgoSubmissionModel(object);
    return submission.save();
  }

  findAll() {
    return this.tgoSubmissionModel.find().exec();
  }

  findById(id: string) {
    return this.tgoSubmissionModel.findById(id).exec();
  }

  findByUsername(username: string) {
    return this.tgoSubmissionModel.find({ username }).exec();
  }
}
