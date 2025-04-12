import { Module } from '@nestjs/common';
import { TgoController } from './tgo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TgoQuestion, TgoQuestionSchema } from '../schemas/tgo/tgo-question.schema';
import { TgoUserData, TgoUserDataSchema } from '../schemas/tgo/tgo-user-data.schema';
import { TgoSubmission, TgoSubmissionSchema } from '../schemas/tgo/tgo-submission.schema';
import { UserModule } from '../user/user.module';
import { TgoQuestionRepository } from './tgo-question.repository';
import { TgoService } from './tgo.service';
import { TgoUserDataRepository } from './tgo-user-data.repository';
import { TgoSubmissionRepository } from './tgo-submission.repository';
import { TgoTimerService } from './tgo-timer.service';
import { TgoGameService } from './tgo-game.service';
import { TgoGateway } from './tgo.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TgoQuestion.name,
        schema: TgoQuestionSchema,
      },
      {
        name: TgoUserData.name,
        schema: TgoUserDataSchema,
      },
      {
        name: TgoSubmission.name,
        schema: TgoSubmissionSchema,
      },
    ]),
    UserModule,
  ],
  controllers: [TgoController],
  providers: [
    TgoGateway,
    TgoGameService,
    TgoService,
    TgoQuestionRepository,
    TgoUserDataRepository,
    TgoSubmissionRepository,
    TgoGameService,
    TgoTimerService,
  ],
  exports: [TgoGateway],
})
export class TgoModule {}
