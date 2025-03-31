import { Module } from '@nestjs/common';
import { CdvqGateway } from './cdvq.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [CdvqGateway],
  exports: [CdvqGateway],
})
export class CdvqModule {}
