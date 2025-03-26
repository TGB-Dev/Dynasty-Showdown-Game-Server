import { Module } from '@nestjs/common';
import { RiseOfKingdomGateway } from './rise-of-kingdom.gateway';

@Module({
  providers: [RiseOfKingdomGateway],
})
export class RiseOfKingdomModule {}
