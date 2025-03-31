import { Module } from '@nestjs/common';
import { TgoGateway } from './tgo.gateway';
import { TgoController } from './tgo.controller';
import { TgoService } from './tgo.service';

@Module({
  providers: [TgoGateway, TgoService],
  controllers: [TgoController],
  exports: [TgoGateway],
})
export class TgoModule {}
