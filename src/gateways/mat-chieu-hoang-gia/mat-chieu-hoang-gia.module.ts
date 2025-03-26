import { Module } from '@nestjs/common';
import { MatChieuHoangGiaGateway } from './mat-chieu-hoang-gia.gateway';

@Module({
  providers: [MatChieuHoangGiaGateway],
})
export class MatChieuHoangGiaModule {}
