import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findUserByUsername(username: string): Promise<User | null> {
    return await this.userModel
      .findOne({
        username: username,
      })
      .exec();
  }

  async createNewUser(username: string, password: string, teamName: string): Promise<User> {
    const newUser = new this.userModel({
      username: username,
      password: password,
      teamName: teamName,
    });

    return await newUser.save();
  }

  increaseScore(user_id: User | mongoose.Types.ObjectId | string, score: number) {
    return this.userModel.findByIdAndUpdate(user_id, { $inc: { score } }, { new: true });
  }

  setScore(user_id: User | mongoose.Types.ObjectId | string, score: number) {
    return this.userModel.findByIdAndUpdate(user_id, { score }, { new: true });
  }
}
