import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { CdvqModule } from '../cdvq/cdvq.module';

@Module({
  imports: [UserModule, CdvqModule],
  controllers: [AdminController],
  providers: [],
  exports: [],
})
export class AdminModule {}
