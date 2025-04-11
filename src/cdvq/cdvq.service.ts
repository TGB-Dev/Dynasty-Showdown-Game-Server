import { Injectable } from '@nestjs/common';
import { CdvqQuestionRepository } from './cdvq-question.repository';
import { QuestionDto } from '../dtos/cdvq.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvq-question.schema';
import { CdvqGameService } from './cdvq-game.service';
import { User } from '../schemas/user.schema';

@Injectable()
export class CdvqService {
  constructor(
    private readonly questionRepository: CdvqQuestionRepository,
    private readonly gameService: CdvqGameService,
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

  startGame() {
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

  getRoundResults() {
    return this.gameService.getRoundResults();
  }

  getCurrentQuestionAnswer(user: User) {
    return this.gameService.getCurrentQuestionAnswer(user);
  }
}
