import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { CdvqModule } from '../cdvq/cdvq.module';
import { MchgModule } from '../mchg/mchg.module';
import { TgoModule } from '../tgo/tgo.module';
import { RokModule } from '../rok/rok.module';
import { GameModule } from '../game/game.module';

@Module({
  imports: [UserModule, GameModule, CdvqModule, MchgModule, TgoModule, RokModule],
  controllers: [AdminController],
  providers: [],
  exports: [],
})
export class AdminModule {}
