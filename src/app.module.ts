import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TestModule } from './test/test.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017'), TestModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
