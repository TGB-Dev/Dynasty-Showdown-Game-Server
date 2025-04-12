import { BadRequestException, Injectable } from '@nestjs/common';
import { MchgRoundRepository } from './mchg-round.repository';
import { CreateRoundReqDto, GetCurrentRoundCurrentQuestionResDto } from '../dtos/mchg.dto';
import { User } from '../schemas/user.schema';
import { MchgQuestionRepository } from './mchg-question.repository';
import { MchgGameService } from './mchg-game.service';
import mongoose from 'mongoose';

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
    void this.gameService.runGame();
  }

  submitAnswer(answer: string, user: User) {
    return this.gameService.submitAnswer(answer, user);
  }

  getCurrentRoundQuestions() {
    return this.questionRepository.getAll();
  }

  async getCurrentRoundCurrentQuestion(): Promise<GetCurrentRoundCurrentQuestionResDto> {
    const currentRound = await this.getCurrentRound();
    const currentQuestion = (await this.questionRepository.findById(currentRound.currentQuestion!))!.toObject();

    if (!currentQuestion) {
      throw new BadRequestException('No currently running question');
    }

    return {
      ...currentQuestion,
      answer: '',
      answerLength: currentQuestion.answer.length,
    };
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

  async getCurrentRequestUser() {
    const queueItem = await this.gameService.getCurrentRequestUser();
    return { username: queueItem.user.username };
  }

  getCurrentQuestionAnswer(userId: mongoose.Types.ObjectId) {
    return this.gameService.getCurrentQuestionAnswer(userId);
  }
}
