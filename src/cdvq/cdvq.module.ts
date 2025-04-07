import { Module } from '@nestjs/common';
import { CdvqGateway } from './cdvq.gateway';
import { CdvqCRUDService, CdvqGameService } from './cdvq.service';
import { CdvqAnswerController, CdvqGameController, CdvqQuestionController } from './cdvq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CdvqQuestion, CdvqQuestionSchema } from '../schemas/cdvq/cdvq-question-schema';
import { UserModule } from '../user/user.module';
import { CdvqQuestionRepository } from './cdvq-question.repository';
import { CdvqScore, CdvqScoreSchema } from '../schemas/cdvq/cdvq-score.schema';
import { CdvqScoreRepository } from './cdvq-score.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CdvqQuestion.name,
        schema: CdvqQuestionSchema,
      },
      {
        name: CdvqScore.name,
        schema: CdvqScoreSchema,
      },
    ]),
    UserModule,
  ],
  controllers: [CdvqQuestionController, CdvqGameController, CdvqAnswerController],
  providers: [CdvqGateway, CdvqCRUDService, CdvqQuestionRepository, CdvqGameService, CdvqScoreRepository],
  exports: [CdvqGateway, CdvqQuestionRepository],
})
export class CdvqModule {}
