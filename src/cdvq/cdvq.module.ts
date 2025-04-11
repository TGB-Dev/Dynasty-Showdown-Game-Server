import { Module } from '@nestjs/common';
import { CdvqGateway } from './cdvq.gateway';
import { CdvqService } from './cdvq.service';
import { CdvqController } from './cdvq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CdvqQuestion, CdvqQuestionSchema } from '../schemas/cdvq/cdvq-question.schema';
import { UserModule } from '../user/user.module';
import { CdvqQuestionRepository } from './cdvq-question.repository';
import { CdvqTimerService } from './cdvq-timer.service';
import { CdvqGameService } from './cdvq-game.service';
import { CdvqSubmission, CdvqSubmissionSchema } from '../schemas/cdvq/cdvq-submission.schema';
import { CdvqSubmissionRepository } from './cdvq-submission.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CdvqQuestion.name,
        schema: CdvqQuestionSchema,
      },
      {
        name: CdvqSubmission.name,
        schema: CdvqSubmissionSchema,
      },
    ]),
    UserModule,
  ],
  controllers: [CdvqController],
  providers: [
    CdvqGateway,
    CdvqQuestionRepository,
    CdvqSubmissionRepository,
    CdvqService,
    CdvqTimerService,
    CdvqGameService,
  ],
  exports: [CdvqGateway, CdvqQuestionRepository],
})
export class CdvqModule {}
