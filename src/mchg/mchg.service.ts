import { Injectable } from '@nestjs/common';
import { MchgRoundRepository } from './mchg-round.repository';
import { CreateRoundReqDto } from '../dtos/mchg.dto';
import { User } from '../schemas/user.schema';
import { MchgQuestionRepository } from './mchg-question.repository';
import { MchgGameService } from './mchg-game.service';

@Injectable()
export class MchgService {
  constructor(
    private readonly gameService: MchgGameService,
    private readonly roundRepository: MchgRoundRepository,
    private readonly questionRepository: MchgQuestionRepository,
  ) {}

  pauseGame() {
    this.gameService.pauseGame();
  }

  resumeGame() {
    this.gameService.resumeGame();
  }

  async createRound(roundDto: Omit<CreateRoundReqDto, 'image'> & { image: Express.Multer.File }) {
    const image = roundDto.image;

    const round = {
      ...roundDto,
      questions: await this.questionRepository.createMany(roundDto.questions),
      image: {
        name: image.filename,
      },
    };

    return this.roundRepository.create(round);
  }

  getAllRounds() {
    return this.roundRepository.getAll();
  }

  getCurrentRound() {
    return this.gameService.getCurrentRound();
  }

  runGame() {
    this.gameService.runGame();
  }

  submitAnswer(answer: string, user: User) {
    return this.gameService.submitAnswer(answer, user);
  }

  getCurrentRoundQuestions() {
    return this.questionRepository.getAll();
  }

  async selectQuestion(index: number) {
    await this.gameService.selectQuestion(index);
  }

  async requestAnswerMainQuestion(user: User) {
    await this.gameService.requestAnswerMainQuestion(user);
  }

  async nextWaitingUserMainQuestion() {
    await this.gameService.nextWaitingUserMainQuestion();
  }

  async rewardMainQuestion() {
    await this.gameService.acceptCurrentUserMainQuestionAnswer();
  }

  getCurrentQuestionAnswer() {
    return this.gameService.getCurrentQuestionAnswer();
  }
}
