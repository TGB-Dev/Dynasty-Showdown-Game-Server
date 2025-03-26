import { Module } from '@nestjs/common';
import { MainControlGateway } from './main-control.gateway';

@Module({
  providers: [MainControlGateway],
})
export class MainControlModule {}
