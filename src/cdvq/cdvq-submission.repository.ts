import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CdvqSubmission } from '../schemas/cdvq/cdvq-submission.schema';
import mongoose, { Model, ObjectId } from 'mongoose';

@Injectable()
export class CdvqSubmissionRepository {
  constructor(@InjectModel(CdvqSubmission.name) private readonly cdvqSubmissionModel: Model<CdvqSubmission>) {}

  create(object: any) {
    const submission = new this.cdvqSubmissionModel(object);
    return submission.save();
  }

  findByUserId(userId: mongoose.Types.ObjectId): Promise<CdvqSubmission[]> {
    return this.cdvqSubmissionModel.find({ user: userId }).exec();
  }

  updateScore(id: string | CdvqSubmission | ObjectId, score: number) {
    return this.cdvqSubmissionModel.findByIdAndUpdate(id, { $set: { score } }, { new: true }).exec();
  }

  getAll(): Promise<CdvqSubmission[]> {
    return this.cdvqSubmissionModel.find().populate('question').exec();
  }

  deleteAll() {
    return this.cdvqSubmissionModel.deleteMany().exec();
  }

  getAllCorrect(): Promise<CdvqSubmission[]> {
    return this.cdvqSubmissionModel.find({ isCorrect: true }).sort({ createdAt: 1 }).exec();
  }

  updateIsCorrect(id: string | CdvqSubmission | ObjectId, isCorrect: boolean) {
    return this.cdvqSubmissionModel.findByIdAndUpdate(id, { $set: { isCorrect } }, { new: true }).exec();
  }

  getByUserIdAndQuestionId(userId: mongoose.Types.ObjectId, questionId: mongoose.Types.ObjectId) {
    return this.cdvqSubmissionModel.findOne({ user: userId, question: questionId }).populate('question').exec();
  }
}
