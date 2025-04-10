import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MchgSubmission } from '../schemas/mchg/mchgSubmission.schema';
import { Model } from 'mongoose';

@Injectable()
export class MchgSubmissionRepository {
  constructor(@InjectModel(MchgSubmission.name) private readonly mchgSubmissionModel: Model<MchgSubmission>) {}

  create(submission: MchgSubmission): Promise<MchgSubmission> {
    const newSubmission = new this.mchgSubmissionModel(submission);
    return newSubmission.save();
  }

  getAll() {
    return this.mchgSubmissionModel.find({}).populate('question').exec();
  }

  deleteAll() {
    return this.mchgSubmissionModel.deleteMany({}).exec();
  }
}
