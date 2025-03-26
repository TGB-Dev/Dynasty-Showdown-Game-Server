import { Module } from '@nestjs/common';
import { CuocDuaVuongQuyenGateway } from './cuoc-dua-vuong-quyen.gateway';

@Module({
  providers: [CuocDuaVuongQuyenGateway],
})
export class CuocDuaVuongQuyenModule {}
