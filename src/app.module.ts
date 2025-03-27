import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { globalConfigs } from './common/constants/global-config.constant';
import { TestModule } from './gateways/test/test.module';
import { CuocDuaVuongQuyenModule } from './gateways/cuoc-dua-vuong-quyen/cuoc-dua-vuong-quyen.module';
import { MatChieuHoangGiaModule } from './gateways/mat-chieu-hoang-gia/mat-chieu-hoang-gia.module';
import { TheGrandOrderModule } from './gateways/the-grand-order/the-grand-order.module';
import { RiseOfKingdomModule } from './gateways/rise-of-kingdom/rise-of-kingdom.module';
import { MainControlModule } from './gateways/main-control/main-control.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot(globalConfigs.mongodbUri),
    TestModule,
    AuthModule,
    UserModule,
    MainControlModule,
    CuocDuaVuongQuyenModule,
    MatChieuHoangGiaModule,
    TheGrandOrderModule,
    RiseOfKingdomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
