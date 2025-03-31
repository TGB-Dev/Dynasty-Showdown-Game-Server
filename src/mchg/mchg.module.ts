import { Module } from '@nestjs/common';
import { MchgGateway } from './mchg.gateway';
import { MchgController } from './mchg.controller';
import { MchgService } from './mchg.service';

@Module({
  providers: [MchgGateway, MchgService],
  controllers: [MchgController],
})
export class MchgModule {}
