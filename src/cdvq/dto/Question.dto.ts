import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({ enum: ['multiple-choice', 'short-answer'], required: true })
  @IsEnum(['multiple-choice', 'short-answer'])
  @IsNotEmpty()
  type: 'multiple-choice' | 'short-answer';

  @ApiProperty({
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(4)
  @ArrayMinSize(4)
  options?: string[];

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class ManyQuestionDto {
  @ApiProperty({ required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
