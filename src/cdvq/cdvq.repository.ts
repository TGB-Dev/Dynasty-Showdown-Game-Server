import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CdvqQuestion } from '../schemas/cdvq/cdvqQuestion.schema';
import { Model } from 'mongoose';
import { CdvqScoreRecordDto, ManyQuestionDto, QuestionDto } from '../dtos/cdvq.dto';
import { CdvqScoreRecord } from '../schemas/cdvq/cdvqScoreRecord.schema';

@Injectable()
export class QuestionRepository {
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

  async getQuestionById(id: string): Promise<CdvqQuestion> {
    const question = await this.cdvqQuestionModel.findById(id).exec();
    if (!question) {
      throw new Error('Question does not exist');
    }
    return question;
  }

  async getFirstWaitingQuestion(): Promise<CdvqQuestion> {
    const question = await this.cdvqQuestionModel.findOne({ status: 'waiting' }).exec();
    if (!question) {
      throw new Error('No waiting question found');
    }
    return question;
  }

  async updateQuestionDate(id: string | CdvqQuestion, date: Date): Promise<{ message: string }> {
    const question = await this.cdvqQuestionModel.findByIdAndUpdate(id, { $set: { date } }, { new: true });
    if (!question) {
      throw new Error('Question does not exist');
    }
    return { message: `Updated question date` };
  }

  async updateQuestionStatus(id: string | CdvqQuestion, status: string) {
    const question = await this.cdvqQuestionModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();
    if (!question) {
      throw new Error('Question does not exist');
    }
  }
}

export class ScoreRecordRepository {
  constructor(@InjectModel(CdvqScoreRecord.name) private readonly cdvqScoreRecord: Model<CdvqScoreRecord>) {}

  async createScore(scoreData: CdvqScoreRecordDto): Promise<{ message: string }> {
    const score = new this.cdvqScoreRecord(scoreData);
    await score.save();
    return { message: `Successfully created score` };
  }

  async getRoundSubmission(currentQuestion: CdvqQuestion): Promise<CdvqScoreRecord[]> {
    return await this.cdvqScoreRecord.find({ questionId: currentQuestion.id }).sort({ answerTime: -1 }).exec();
  }

  async checkSubmittedUser(username: string, questionID: string, roundNumber: number): Promise<boolean> {
    const existingRecord = await this.cdvqScoreRecord
      .findOne({ username: username, questionId: questionID, roundNumber: roundNumber })
      .exec();
    return !!existingRecord;
  }

  async getRoundResult(currentQuestion: CdvqQuestion): Promise<CdvqScoreRecord[]> {
    return await this.cdvqScoreRecord
      .find({ questionId: currentQuestion.id })
      .sort({ answerTime: 1 })
      .select({ username: 1, answerTime: 1, isCorrect: 1, _id: 0 })
      .exec();
  }
}
