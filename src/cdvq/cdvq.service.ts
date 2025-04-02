import { Injectable } from '@nestjs/common';
import { CdvqGateway } from './cdvq.gateway';
import { CdvqRepository } from './cdvq.repository';
import { ManyQuestionDto, QuestionDto } from './dto/Question.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvqQuestion.schema';

@Injectable()
export class CdvqService {
  constructor(
    private readonly cdvqGateway: CdvqGateway,
    private readonly cdvqRepository: CdvqRepository,
  ) {}

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
