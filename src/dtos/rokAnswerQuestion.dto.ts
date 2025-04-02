import { ApiProperty } from '@nestjs/swagger';

export class RokAnswerQuestionDto {
  @ApiProperty({ description: "Required if the question's answer type is short answer." })
  answer: string;

  @ApiProperty({ description: "Required if the question's answer type is multiple choices." })
  choiceIndex: number;
}
