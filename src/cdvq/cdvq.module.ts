import { Module } from '@nestjs/common';
import { CdvqGateway } from './cdvq.gateway';
import { CdvqCRUDService, CdvqGameService } from './cdvq.service';
import { CdvqAnswerController, CdvqGameController, CdvqQuestionController } from './cdvq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CdvqQuestion, CdvqQuestionSchema } from '../schemas/cdvq/cdvqQuestion.schema';
import { UserModule } from '../user/user.module';
import { QuestionRepository, ScoreRecordRepository } from './cdvq.repository';
import { CdvqScoreRecord, CdvqScoreRecordSchema } from '../schemas/cdvq/cdvqScoreRecord.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CdvqQuestion.name,
        schema: CdvqQuestionSchema,
      },
      {
        name: CdvqScoreRecord.name,
        schema: CdvqScoreRecordSchema,
      },
    ]),
    UserModule,
  ],
  controllers: [CdvqQuestionController, CdvqGameController, CdvqAnswerController],
  providers: [CdvqGateway, CdvqCRUDService, QuestionRepository, CdvqGameService, ScoreRecordRepository],
  exports: [CdvqGateway, QuestionRepository],
})
export class CdvqModule {}
