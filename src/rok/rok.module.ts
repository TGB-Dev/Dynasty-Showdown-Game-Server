import { Module } from '@nestjs/common';
import { RokGateway } from './rok.gateway';
import { RokController } from './rok.controller';
import { RokService } from './rok.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RokMatrixState, RokMatrixStateSchema } from '../schemas/rok/rokMatrixState.schema';
import { RokAttack, RokAttackSchema } from '../schemas/rok/rokAttack.schema';
import { RokRepository } from './rok.repository';
import { RokQuestion, RokQuestionSchema } from '../schemas/rok/rokQuestion.schema';
import { UserModule } from '../user/user.module';
import { RokTimerService } from './rok-timer.service';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: RokAttack.name, schema: RokAttackSchema },
      {
        name: RokMatrixState.name,
        schema: RokMatrixStateSchema,
      },
      {
        name: RokQuestion.name,
        schema: RokQuestionSchema,
      },
    ]),
  ],
  providers: [RokGateway, RokRepository, RokService, RokTimerService],
  controllers: [RokController],
  exports: [RokRepository, RokGateway],
})
export class RokModule {}
