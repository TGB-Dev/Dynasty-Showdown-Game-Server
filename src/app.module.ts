import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { globalConfigs } from './constants/globalConfig.const';
import { TestModule } from './gateways/test/test.module';

@Module({
  imports: [MongooseModule.forRoot(globalConfigs.mongodbUri), TestModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
