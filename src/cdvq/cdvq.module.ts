import { Module } from '@nestjs/common';
import { CdvqGateway } from './cdvq.gateway';
import { CdvqGameService, CdvqService } from './cdvq.service';
import { CdvqAnswerController, CdvqController, CdvqGameController } from './cdvq.controller';
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
  controllers: [CdvqGameController, CdvqAnswerController, CdvqController],
  providers: [CdvqGateway, CdvqQuestionRepository, CdvqGameService, CdvqScoreRepository, CdvqService],
  exports: [CdvqGateway, CdvqQuestionRepository],
})
export class CdvqModule {}
