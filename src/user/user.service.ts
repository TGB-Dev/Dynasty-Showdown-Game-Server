import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async updateScore(user_id: string, action: 'set' | 'inc', score: number) {
    let result: User | null;

    if (action === 'set') {
      result = await this.userRepository.setScore(user_id, score);
    } else {
      result = await this.userRepository.increaseScore(user_id, score);
    }

    if (result === null) throw new NotFoundException();
    return result;
  }

  async getLeaderBoard() {
    const users = (await this.userRepository.findAll()).map((user) => user.toObject());
    if (users.length === 0) throw new NotFoundException('No users found');
    return users;
  }
}
