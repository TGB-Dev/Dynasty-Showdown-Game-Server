import { Module } from '@nestjs/common';
import { MchgGateway } from './mchg.gateway';
import { MchgController } from './mchg.controller';
import { MchgService } from './mchg.service';
import { MchgRepository } from './mchg.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { MchgRound, MchgRoundSchema } from '../schemas/mchg/mchgRound.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: MchgRound.name, schema: MchgRoundSchema }]), UserModule],
  providers: [MchgGateway, MchgService, MchgRepository],
  controllers: [MchgController],
})
export class MchgModule {}
