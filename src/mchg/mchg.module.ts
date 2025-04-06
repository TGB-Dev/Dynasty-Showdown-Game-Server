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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MchgRound.name, schema: MchgRoundSchema },
      { name: MchgSubmission.name, schema: MchgSubmissionSchema },
      { name: MchgQuestion.name, schema: MchgQuestionSchema },
    ]),
    UserModule,
  ],
  providers: [MchgGateway, MchgService, MchgRoundRepository, MchgSubmissionRepository, MchgQuestionRepository],
  controllers: [MchgController],
  exports: [MchgGateway],
})
export class MchgModule {}
