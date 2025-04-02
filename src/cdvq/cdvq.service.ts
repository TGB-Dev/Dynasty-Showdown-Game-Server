import { BadRequestException, Injectable } from '@nestjs/common';
import { QuestionRepository } from './cdvq.repository';
import { ManyQuestionDto, QuestionDto } from '../dtos/cdvq.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvqQuestion.schema';
import { CdvqGateway } from './cdvq.gateway';

@Injectable()
export class CdvqCRUDService {
  constructor(private readonly cdvqRepository: QuestionRepository) {}

  async createQuestion(questionDTO: QuestionDto): Promise<{ message: string }> {
    return await this.cdvqRepository.createQuestion(questionDTO);
  }

  async createManyQuestion(questionsDto: ManyQuestionDto): Promise<{ message: string }> {
    return await this.cdvqRepository.createManyQuestion(questionsDto);
  }

  async deleteQuestion(questionId: string): Promise<{ message: string }> {
    return await this.cdvqRepository.deleteQuestion(questionId);
  }

  async updateQuestion(questionId: string, updateData: QuestionDto): Promise<{ message: string }> {
    return await this.cdvqRepository.updateQuestion(questionId, updateData);
  }

  async getQuestions(): Promise<CdvqQuestion[]> {
    return await this.cdvqRepository.getQuestions();
  }
}

@Injectable()
export class CdvqGameService {
  private gameState: 'WAITING' | 'RUNNING' | 'PAUSED' | 'ENDED' = 'WAITING';
  private remainingTime: number;
  private timer: NodeJS.Timeout;
  constructor(private readonly gameGateway: CdvqGateway) {}

  private startCountdown() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.gameState === 'RUNNING') {
        this.remainingTime--;
        this.gameGateway.emitTimerUpdate(this.remainingTime);
        if (this.remainingTime <= 0) {
          clearInterval(this.timer);
          this.gameState = 'RUNNING';
          this.gameGateway.emitGameEnded();
        }
      }
    }, 1000);
  }
  startGame(totalTime: number) {
    if (totalTime <= 0 || totalTime === null) {
      throw new Error('Invalid time');
    }
    if (this.gameState !== 'WAITING' && this.gameState !== 'ENDED') {
      throw new BadRequestException('Game started');
    }
    this.gameState = 'RUNNING';
    this.remainingTime = totalTime;
    this.startCountdown();
    return { message: `Game started`, remainingTime: this.remainingTime };
  }

  pauseGame() {
    if (this.gameState !== 'RUNNING') {
      throw new BadRequestException('Cannot pause');
    }
    this.gameState = 'PAUSED';
    clearInterval(this.timer);
    this.gameGateway.emitGamePaused();
    return { message: `Game paused`, remainingTime: this.remainingTime };
  }

  resumeGame() {
    if (this.gameState !== 'PAUSED') {
      throw new BadRequestException('Cannot resume');
    }
    this.gameState = 'RUNNING';
    this.startCountdown();
    this.gameGateway.emitGameResumed();
    return { message: `Game resumed`, remainingTime: this.remainingTime };
  }

  endGame() {
    if (this.gameState !== 'RUNNING' && this.gameState !== 'PAUSED') {
      throw new BadRequestException('Cannot end');
    }
    this.gameState = 'ENDED';
    clearInterval(this.timer);
    this.gameGateway.emitGameEnded();
    return { message: `Game ended`, remainingTime: this.remainingTime };
  }
}
