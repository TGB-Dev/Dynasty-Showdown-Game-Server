import { ApiProperty } from '@nestjs/swagger';

export class SendRokQuestionDto {
  @ApiProperty()
  question: string;

  @ApiProperty()
  isMultiple: boolean;

  @ApiProperty({ description: 'Will be sent if `isMultiple = true`' })
  choices?: string[];
}
