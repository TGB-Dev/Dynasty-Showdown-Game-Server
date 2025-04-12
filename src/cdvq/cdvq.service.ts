import { BadRequestException, Injectable } from '@nestjs/common';
import { CdvqQuestionRepository } from './cdvq-question.repository';
import { QuestionDto } from '../dtos/cdvq.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvq-question.schema';
import { CdvqGameService } from './cdvq-game.service';
import { User } from '../schemas/user.schema';
import { GameRepository } from '../game/game.repository';
import { Room } from '../common/enum/room.enum';

@Injectable()
export class CdvqService {
  constructor(
    private readonly questionRepository: CdvqQuestionRepository,
    private readonly gameService: CdvqGameService,
    private readonly gameRepository: GameRepository,
  ) {}

  getCurrentQuestion() {
    return this.gameService.getCurrentQuestion();
  }

  getQuestions(): Promise<CdvqQuestion[]> {
    return this.questionRepository.getAll();
  }

  createQuestion(questionDTO: QuestionDto) {
    return this.questionRepository.create(questionDTO);
  }

  deleteQuestion(questionId: string) {
    return this.questionRepository.delete(questionId);
  }

  updateQuestion(questionId: string, updateData: QuestionDto) {
    return this.questionRepository.update(questionId, updateData);
  }

  async startGame() {
    const cdvqGame = await this.gameRepository.getGameByName(Room.CDVQ);
    if (!cdvqGame) {
      throw new BadRequestException('CDVQ game not found');
    }

    if (!cdvqGame.running) throw new BadRequestException('Game is not running');
    if (cdvqGame.started) throw new BadRequestException('Game already started');

    return this.gameService.startGame();
  }

  stopGame() {
    return this.gameService.stopGame();
  }

  pauseGame() {
    return this.gameService.pauseGame();
  }

  resumeGame() {
    return this.gameService.resumeGame();
  }

  answerCurrentQuestion(user: User, answer: string) {
    return this.gameService.answerCurrentQuestion(user, answer);
  }

  async getRoundResults() {
    return (await this.gameService.getRoundResults()).map((result) => ({
      username: result.user.username,
      score: result.score,
      createdAt: result.createdAt,
    }));
  }

  getCurrentQuestionAnswer(user: User) {
    return this.gameService.getCurrentQuestionAnswer(user);
  }
}
