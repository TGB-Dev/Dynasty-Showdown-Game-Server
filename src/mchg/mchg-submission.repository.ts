import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MchgSubmission } from '../schemas/mchg/mchgSubmission.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class MchgSubmissionRepository {
  constructor(@InjectModel(MchgSubmission.name) private readonly mchgSubmissionModel: Model<MchgSubmission>) {}

  create(submission: any): Promise<MchgSubmission> {
    const newSubmission = new this.mchgSubmissionModel(submission);
    return newSubmission.save();
  }

  getAll() {
    return this.mchgSubmissionModel.find({}).populate('question').exec();
  }

  deleteAll() {
    return this.mchgSubmissionModel.deleteMany({}).exec();
  }

  async findByUserIdAndQuestionId(userId: mongoose.Types.ObjectId, questionId: mongoose.Types.ObjectId) {
    return (
      await this.mchgSubmissionModel.findOne({ user: userId, question: questionId }).populate('question').exec()
    )?.toObject();
  }

  async getAllByQuestionId(questionId: mongoose.Types.ObjectId) {
    console.log(questionId);
    return this.mchgSubmissionModel.find({ question: questionId }).populate('question').exec();
  }
}
