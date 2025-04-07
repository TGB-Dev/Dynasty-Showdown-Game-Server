import { BadRequestException, Injectable } from '@nestjs/common';
import { CdvqQuestionRepository } from './cdvq-question.repository';
import { QuestionDto } from '../dtos/cdvq.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvq-question-schema';
import { CdvqGameState } from '../common/enum/cdvq/cdvq-game-state.enum';
import { CdvqScoreRepository } from './cdvq-score.repository';
import { CdvqRoundState } from '../common/enum/cdvq/cdvq-round-state.enum';
import { CdvqTimerService } from './cdvq-timer.service';
import { CdvqGateway } from './cdvq.gateway';
import { CdvqGameService } from './cdvq-game.service';

@Injectable()
export class CdvqService {
  constructor(
    private readonly questionRepository: CdvqQuestionRepository,
    private readonly scoreRepository: CdvqScoreRepository,
    private readonly gameService: CdvqGameService,
  ) {}

  private timerIsRunning = false;

  getCurrentQuestion() {
    return this.gameService.getCurrentQuestion();
  }

  getQuestionById(id: string) {
    return this.questionRepository.getById(id);
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
}
