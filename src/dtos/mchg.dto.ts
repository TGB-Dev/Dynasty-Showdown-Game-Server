import { PickType } from '@nestjs/swagger';
import { MchgRound } from '../schemas/mchg/mchgRound.schema';

export class CreateRoundReqDto extends PickType(MchgRound, ['order', 'questions', 'image'] as const) {}

export class CreateRoundResDto extends PickType(MchgRound, ['_id', 'order', 'questions', 'image'] as const) {}
