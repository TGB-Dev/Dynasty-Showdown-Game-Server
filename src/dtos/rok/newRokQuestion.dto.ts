import { ApiProperty } from '@nestjs/swagger';

export class NewRokQuestionDto {
  @ApiProperty()
  question: string;

  @ApiProperty()
  isMultiple: boolean;

  @ApiProperty({ description: 'The correct answer. Required when `isMultiple = false`' })
  answer: string;

  @ApiProperty({ description: 'The available choices. Required when `isMultiple = true`' })
  choices: string[];

  @ApiProperty({
    description: 'The index of the correct choice inside the `choices` array. Required when `isMultiple = true`',
  })
  correctChoiceIndex: number;
}
