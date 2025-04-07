import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { globalConfigs } from './common/constants/global-config.constant';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { CdvqModule } from './cdvq/cdvq.module';
import { MchgModule } from './mchg/mchg.module';
import { TgoModule } from './tgo/tgo.module';

// import { RokModule } from './rok/rok.module';

@Module({
  imports: [
    MongooseModule.forRoot(globalConfigs.mongodbUri),
    AuthModule,
    UserModule,
    AdminModule,
    CdvqModule,
    MchgModule,
    TgoModule,
    // RokModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
