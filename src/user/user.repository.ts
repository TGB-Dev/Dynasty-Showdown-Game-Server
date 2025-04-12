import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findUserByUsername(username: string) {
    return await this.userModel
      .findOne({
        username: username,
      })
      .exec();
  }

  async createNewUser(username: string, password: string) {
    const newUser = new this.userModel({
      username: username,
      password: password,
    });

    return await newUser.save();
  }

  async findAll() {
    return await this.userModel.find({}).sort({ score: -1 }).exec();
  }

  increaseScore(user_id: User | mongoose.Types.ObjectId | string, score: number) {
    return this.userModel.findByIdAndUpdate(user_id, { $inc: { score } }, { new: true });
  }

  setScore(user_id: User | mongoose.Types.ObjectId | string, score: number) {
    return this.userModel.findByIdAndUpdate(user_id, { score }, { new: true });
  }

  async getTeamUsernames() {
    return (await this.userModel.find({}).exec()).map((user) => user.username);
  }
}
