import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { CdvqModule } from '../cdvq/cdvq.module';
import { MchgModule } from '../mchg/mchg.module';

@Module({
  imports: [UserModule, CdvqModule, MchgModule],
  controllers: [AdminController],
  providers: [],
  exports: [],
})
export class AdminModule {}
