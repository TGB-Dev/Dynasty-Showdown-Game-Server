import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CdvqQuestion } from '../schemas/cdvq/cdvqQuestion.schema';
import { Model } from 'mongoose';
import { ManyQuestionDto, QuestionDto } from './dto/Question.dto';

@Injectable()
export class CdvqRepository {
  constructor(@InjectModel(CdvqQuestion.name) private readonly cdvqQuestionModel: Model<CdvqQuestion>) {}

  async createQuestion(questionDTO: QuestionDto): Promise<{ message: string }> {
    const question = new this.cdvqQuestionModel(questionDTO);
    await question.save();
    return { message: `Created Question ${question.id}` };
  }

  async createManyQuestion(questionsDto: ManyQuestionDto): Promise<{ message: string }> {
    const questionsData = questionsDto.questions;
    await this.cdvqQuestionModel.insertMany(questionsData);
    return { message: `Successfully created ${questionsData.length} questions` };
  }

  async deleteQuestion(id: string): Promise<{ message: string }> {
    const deletedQuestion = await this.cdvqQuestionModel.findByIdAndDelete(id).exec();

    if (!deletedQuestion) {
      throw new Error('Question does not exist');
    }
    return { message: `Deleted question ${id}` };
  }

  async updateQuestion(id: string, questionDto: QuestionDto): Promise<{ message: string }> {
    const updateQuestion = await this.cdvqQuestionModel.findByIdAndUpdate(id, questionDto).exec();
    if (!updateQuestion) {
      throw new Error('Question does not exist');
    }
    return { message: `Updated question ${id}` };
  }

  async getQuestions(): Promise<CdvqQuestion[]> {
    return await this.cdvqQuestionModel.find().exec();
  }
}
