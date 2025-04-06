import { PickType } from '@nestjs/swagger';
import { MchgRound } from '../schemas/mchg/mchgRound.schema';
import { MchgSubmission } from '../schemas/mchg/mchgSubmission.schema';

export class CreateRoundReqDto extends PickType(MchgRound, ['order', 'questions', 'image', 'answer'] as const) {}

export class CreateRoundResDto extends MchgRound {}

export class GetAllRoundsResDto extends PickType(MchgRound, ['_id', 'order', 'questions', 'image'] as const) {}

export class GetCurrentRoundResDto extends PickType(MchgRound, [
  '_id',
  'order',
  'questions',
  'currentQuestion',
  'image',
  'answer',
] as const) {}

export class SubmitAnswerReqDto extends PickType(MchgSubmission, ['answer'] as const) {}
