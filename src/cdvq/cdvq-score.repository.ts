import { InjectModel } from '@nestjs/mongoose';
import { CdvqScore } from '../schemas/cdvq/cdvq-score.schema';
import { Model } from 'mongoose';
import { CdvqScoreRecordDto } from '../dtos/cdvq.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvq-question-schema';

export class CdvqScoreRepository {
  constructor(@InjectModel(CdvqScore.name) private readonly cdvqScoreModel: Model<CdvqScore>) {}

  create(scoreData: CdvqScoreRecordDto) {
    const score = new this.cdvqScoreModel(scoreData);
    return score.save();
  }

  getByQuestion(question: CdvqQuestion): Promise<CdvqScore[]> {
    return this.cdvqScoreModel.find({ questionId: question._id }).sort({ answerTime: -1 }).exec();
  }

  getByQuestionAndUser(username: string, questionID: string) {
    return this.cdvqScoreModel.findOne({ username: username, questionId: questionID }).exec();
  }

  getRoundResult(currentQuestion: CdvqQuestion): Promise<CdvqScore[]> {
    return this.cdvqScoreModel
      .find({ questionId: currentQuestion._id })
      .sort({ answerTime: 1 })
      .select({ username: 1, answerTime: 1, isCorrect: 1, _id: 0 })
      .exec();
  }
}
