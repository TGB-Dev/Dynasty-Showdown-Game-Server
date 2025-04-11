import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MchgSubmission } from '../schemas/mchg/mchgSubmission.schema';
import { Model } from 'mongoose';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class MchgSubmissionRepository {
  constructor(
    @InjectModel(MchgSubmission.name) private readonly mchgSubmissionModel: Model<MchgSubmission>,
    private readonly userRepository: UserRepository,
  ) {}

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

  async findByUsername(username: string) {
    const user = await this.userRepository.findUserByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username ${username} does not exist`);
    }

    return (await this.mchgSubmissionModel.findOne({ user: user._id }).populate('question').exec())?.toObject();
  }
}
