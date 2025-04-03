import { BadRequestException, Injectable } from '@nestjs/common';
import { MchgRoundRepository } from './mchg-round.repository';
import { CreateRoundReqDto } from '../dtos/mchg.dto';
import { User } from '../schemas/user.schema';
import { MchgSubmissionRepository } from './mchg-submission.repository';
import { MchgQuestionRepository } from './mchg-question.repository';

@Injectable()
export class MchgService {
  private roundIndex: number | null = null;

  constructor(
    private readonly mchgRoundRepository: MchgRoundRepository,
    private readonly mchgSubmissionRepository: MchgSubmissionRepository,
    private readonly mchgQuestionRepository: MchgQuestionRepository,
  ) {}

  async createRound(roundDto: Omit<CreateRoundReqDto, 'image'> & { image: Express.Multer.File }) {
    const image = roundDto.image;

    const round = {
      questions: await Promise.all(roundDto.questions.map((question) => this.mchgQuestionRepository.create(question))),
      order: roundDto.order,
      questionIndex: 0,
      image: {
        name: image.filename,
      },
    };

    return this.mchgRoundRepository.create(round);
  }

  getAllRounds() {
    return this.mchgRoundRepository.getAll();
  }

  getCurrentRound() {
    if (this.roundIndex === null) {
      throw new BadRequestException('Game is not running');
    }

    return this.mchgRoundRepository.getByOrder(this.roundIndex);
  }

  async getCurrentQuestion() {
    const currentRound = await this.getCurrentRound();

    return currentRound.questions[currentRound.questionIndex];
  }

  runGame() {
    this.roundIndex = 0;
  }

  async submitAnswer(answer: string, user: User) {
    const currentQuestion = await this.getCurrentQuestion();

    const submission = {
      question: currentQuestion,
      answer,
      user,
    };

    return this.mchgSubmissionRepository.create(submission);
  }
}
