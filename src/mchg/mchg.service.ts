import { BadRequestException, Injectable } from '@nestjs/common';
import { MchgRoundRepository } from './mchg-round.repository';
import { CreateRoundReqDto } from '../dtos/mchg.dto';
import { MchgRound } from '../schemas/mchg/mchgRound.schema';
import { MchgSubmission } from '../schemas/mchg/mchgSubmission.schema';
import { User } from '../schemas/user.schema';
import { MchgSubmissionRepository } from './mchg-submission.repository';

@Injectable()
export class MchgService {
  private roundIndex: number | null = null;

  constructor(
    private readonly mchgRoundRepository: MchgRoundRepository,
    private readonly mchgSubmissionRepository: MchgSubmissionRepository,
  ) {}

  createRound(roundDto: Omit<CreateRoundReqDto, 'image'> & { image: Express.Multer.File }) {
    const image = roundDto.image;

    const roundObject: MchgRound = {
      ...roundDto,
      questionIndex: 0,
      image: {
        name: image.filename,
      },
    };

    return this.mchgRoundRepository.create(roundObject);
  }

  getAllRounds() {
    return this.mchgRoundRepository.getAll();
  }

  getCurrentRound() {
    if (this.roundIndex === null) {
      throw new BadRequestException('Game not started yet');
    }

    return this.mchgRoundRepository.getByOrder(this.roundIndex);
  }

  async getCurrentQuestion() {
    const currentRound = await this.getCurrentRound();

    return currentRound.questions[currentRound.questionIndex];
  }

  startGame() {
    this.roundIndex = 0;
  }

  async submitAnswer(answer: string, user: User) {
    const currentQuestion = await this.getCurrentQuestion();

    const submission: MchgSubmission = {
      question: currentQuestion,
      answer,
      user,
    };

    return this.mchgSubmissionRepository.create(submission);
  }
}
