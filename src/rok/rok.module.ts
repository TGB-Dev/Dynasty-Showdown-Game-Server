import { Module } from '@nestjs/common';
import { RokGateway } from './rok.gateway';
import { RokController } from './rok.controller';
import { RokService } from './rok.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RokMatrixState, RokMatrixStateSchema } from '../schemas/rokMatrixState';
import { RokStatus, RokStatusSchema } from '../schemas/rokStatus.schema';
import { RokRepository } from './rok.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RokStatus.name, schema: RokStatusSchema },
      {
        name: RokMatrixState.name,
        schema: RokMatrixStateSchema,
      },
    ]),
  ],
  providers: [RokGateway, RokService, RokRepository],
  controllers: [RokController],
  exports: [RokRepository, RokGateway],
})
export class RokModule {}
