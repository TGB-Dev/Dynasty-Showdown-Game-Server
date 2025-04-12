import { Module } from '@nestjs/common';
import { MchgGateway } from './mchg.gateway';
import { MchgController } from './mchg.controller';
import { MchgService } from './mchg.service';
import { MchgRoundRepository } from './mchg-round.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { MchgRound, MchgRoundSchema } from '../schemas/mchg/mchgRound.schema';
import { UserModule } from '../user/user.module';
import { MchgSubmission, MchgSubmissionSchema } from '../schemas/mchg/mchgSubmission.schema';
import { MchgSubmissionRepository } from './mchg-submission.repository';
import { MchgQuestionRepository } from './mchg-question.repository';
import { MchgQuestion, MchgQuestionSchema } from '../schemas/mchg/mchgQuestion.schema';
import { MchgMainQuestionQueue, MchgMainQuestionQueueSchema } from '../schemas/mchg/mchgMainQuestionQueue.schema';
import { MchgMainQuestionQueueRepository } from './mchg-main-question-queue.repository';
import { MchgGameService } from './mchg-game.service';
import { MchgTimerService } from './mchg-timer.service';
import { MchgAnswerQueueService } from './mchg-answer-queue.service';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MchgRound.name, schema: MchgRoundSchema },
      { name: MchgSubmission.name, schema: MchgSubmissionSchema },
      { name: MchgQuestion.name, schema: MchgQuestionSchema },
      { name: MchgMainQuestionQueue.name, schema: MchgMainQuestionQueueSchema },
    ]),
    UserModule,
    GameModule,
  ],
  providers: [
    MchgGateway,
    MchgService,
    MchgGameService,
    MchgTimerService,
    MchgAnswerQueueService,
    MchgRoundRepository,
    MchgSubmissionRepository,
    MchgQuestionRepository,
    MchgMainQuestionQueueRepository,
  ],
  controllers: [MchgController],
  exports: [MchgGateway],
})
export class MchgModule {}
