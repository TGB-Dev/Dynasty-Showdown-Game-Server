import { BadRequestException, Injectable } from '@nestjs/common';
import { MchgMainQuestionQueueRepository } from './mchg-main-question-queue.repository';
import { User } from '../schemas/user.schema';

@Injectable()
export class MchgAnswerQueueService {
  constructor(private readonly mainQuestionQueueRepository: MchgMainQuestionQueueRepository) {}

  async enqueue(user: User) {
    if (!(await this.mainQuestionQueueRepository.findByUser(user)))
      return this.mainQuestionQueueRepository.create(user);
  }

  dequeue() {
    return this.mainQuestionQueueRepository.deleteFirstCreated();
  }

  async top() {
    const queue = await this.mainQuestionQueueRepository.getAll();

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
