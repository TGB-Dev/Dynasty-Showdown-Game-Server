import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { RokQuestion } from '../schemas/rok/rokQuestion.schema';

export class NewRokQuestionDto extends PickType(RokQuestion, [
  'question',
  'isMultiple',
  'answer',
  'choices',
  'correctChoiceIndex',
] as const) {}

export class RokAnswerQuestionDto {
  @ApiProperty({ description: "Required if the question's answer type is short answer." })
  answer: string;

  @ApiProperty({ description: "Required if the question's answer type is multiple choices." })
  choiceIndex: number;
}

export class SendRokQuestionDto extends PickType(RokQuestion, ['_id', 'question', 'isMultiple', 'choices'] as const) {}

export class UpdateRokQuestionDto extends PartialType(NewRokQuestionDto) {}
