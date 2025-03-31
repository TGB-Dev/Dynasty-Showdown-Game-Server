import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { globalConfigs } from './common/constants/global-config.constant';
import { TestModule } from './gateways/test/test.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { CdvqModule } from './cdvq/cdvq.module';

@Module({
  imports: [
    MongooseModule.forRoot(globalConfigs.mongodbUri),
    TestModule,
    AuthModule,
    UserModule,
    AdminModule,
    CdvqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
