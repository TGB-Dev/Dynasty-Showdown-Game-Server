import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

export class CdvqScoreRecordDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  questionId: string;
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  roundNumber: number;

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsNotEmpty()
  isCorrect: boolean;

  @ApiProperty({ required: true })
  @IsNumber()
  answerTime: number;
}

export class CdvqTeamsResultsDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  answerTime: number;

  @ApiProperty({ required: true })
  @IsBoolean()
  @IsNotEmpty()
  isCorrect: boolean;
}
