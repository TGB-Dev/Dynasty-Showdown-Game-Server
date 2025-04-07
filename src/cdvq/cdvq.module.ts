import { Module } from '@nestjs/common';
import { CdvqGateway } from './cdvq.gateway';
import { CdvqService } from './cdvq.service';
import { CdvqController } from './cdvq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CdvqQuestion, CdvqQuestionSchema } from '../schemas/cdvq/cdvq-question-schema';
import { UserModule } from '../user/user.module';
import { CdvqQuestionRepository } from './cdvq-question.repository';
import { CdvqScore, CdvqScoreSchema } from '../schemas/cdvq/cdvq-score.schema';
import { CdvqScoreRepository } from './cdvq-score.repository';
import { CdvqTimerService } from './cdvq-timer.service';
import { CdvqGameService } from './cdvq-game.service';

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
  controllers: [CdvqController],
  providers: [CdvqGateway, CdvqQuestionRepository, CdvqScoreRepository, CdvqService, CdvqTimerService, CdvqGameService],
  exports: [CdvqGateway, CdvqQuestionRepository],
})
export class CdvqModule {}
