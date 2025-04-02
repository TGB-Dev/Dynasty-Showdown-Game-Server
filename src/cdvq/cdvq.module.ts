import { Module } from '@nestjs/common';
import { CdvqGateway } from './cdvq.gateway';
import { CdvqService } from './cdvq.service';
import { CdvqController } from './cdvq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CdvqTeam, CdvqTeamSchema } from '../schemas/cdvq/cdvqTeam.schema';
import { CdvqQuestion, CdvqQuestionSchema } from '../schemas/cdvq/cdvqQuestion.schema';
import { CdvqStatus, CdvqStatusSchema } from '../schemas/cdvq/cdvqStatus.schema';
import { UserModule } from '../user/user.module';
import { CdvqRepository } from './cdvq.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CdvqTeam.name,
        schema: CdvqTeamSchema,
      },
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
  controllers: [CdvqController],
  providers: [CdvqGateway, CdvqService, CdvqRepository],
  exports: [CdvqGateway, CdvqRepository],
})
export class CdvqModule {}
