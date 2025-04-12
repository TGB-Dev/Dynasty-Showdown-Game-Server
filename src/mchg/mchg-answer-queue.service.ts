import { BadRequestException, Injectable } from '@nestjs/common';
import { MchgMainQuestionQueueRepository } from './mchg-main-question-queue.repository';
import { User } from '../schemas/user.schema';

@Injectable()
export class MchgAnswerQueueService {
  constructor(private readonly mainQuestionQueueRepository: MchgMainQuestionQueueRepository) {}

  async enqueue(user: User) {
    if (!(await this.findByUser(user))) {
      return this.mainQuestionQueueRepository.create(user);
    }
  }

  async findByUser(user: User) {
    return await this.mainQuestionQueueRepository.findByUser(user);
  }

  dequeue() {
    return this.mainQuestionQueueRepository.markFirstCreated();
  }

  async top() {
    const queue = await this.mainQuestionQueueRepository.getAllUnselected();

    if (queue.length === 0) throw new BadRequestException('Empty queue');
    return queue[0].toObject();
  }

  clear() {
    return this.mainQuestionQueueRepository.deleteAll();
  }

  async length() {
    return this.mainQuestionQueueRepository.length();
  }
}
