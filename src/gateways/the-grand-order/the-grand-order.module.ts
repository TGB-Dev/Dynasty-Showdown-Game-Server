import { Module } from '@nestjs/common';
import { TheGrandOrderGateway } from './the-grand-order.gateway';

@Module({
  providers: [TheGrandOrderGateway],
})
export class TheGrandOrderModule {}
