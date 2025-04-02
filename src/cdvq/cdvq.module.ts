import { Module } from '@nestjs/common';
import { CdvqGateway } from './cdvq.gateway';
import { CdvqCRUDService, CdvqGameService } from './cdvq.service';
import { CdvqGameController, CdvqQuestionController } from './cdvq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CdvqQuestion, CdvqQuestionSchema } from '../schemas/cdvq/cdvqQuestion.schema';
import { CdvqStatus, CdvqStatusSchema } from '../schemas/cdvq/cdvqStatus.schema';
import { UserModule } from '../user/user.module';
import { QuestionRepository } from './cdvq.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CdvqQuestion.name,
        schema: CdvqQuestionSchema,
      },
      {
        name: CdvqStatus.name,
        schema: CdvqStatusSchema,
      },
    ]),
    UserModule,
  ],
  controllers: [CdvqQuestionController, CdvqGameController],
  providers: [CdvqGateway, CdvqCRUDService, QuestionRepository, CdvqGameService],
  exports: [CdvqGateway, QuestionRepository],
})
export class CdvqModule {}
