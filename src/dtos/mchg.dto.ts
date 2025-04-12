import { PickType } from '@nestjs/swagger';
import { MchgRound } from '../schemas/mchg/mchgRound.schema';
import { MchgSubmission } from '../schemas/mchg/mchgSubmission.schema';
import { Expose, Type } from 'class-transformer';
import { UserRole } from '../common/enum/roles.enum';

export class CreateRoundReqDto extends PickType(MchgRound, ['order', 'questions', 'answer'] as const) {
  image: string;
}

export class CreateRoundResDto extends MchgRound {}

export class GetAllRoundsResDto extends PickType(MchgRound, ['_id', 'order', 'questions', 'image'] as const) {}

class QuestionDto {
  @Expose({ groups: [UserRole.ADMIN] })
  question: string;

  @Expose({ groups: [UserRole.ADMIN] })
  answer: string;

  @Expose({ groups: [UserRole.ADMIN, UserRole.PLAYER] })
  solved: boolean;
}

export class GetCurrentRoundResDto extends PickType(MchgRound, [
  '_id',
  'order',
  'currentQuestion',
  'image',
  'answer',
] as const) {
  @Expose()
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}

export class SubmitAnswerReqDto extends PickType(MchgSubmission, ['answer'] as const) {}

export class GetCurrentRoundCurrentQuestionResDto extends QuestionDto {
  @Expose()
  answerLength: number;
}

export class GetCurrentRequestUserResDto {
  username: string;
}
