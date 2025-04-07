import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { Prop } from '@nestjs/mongoose';
import { CdvqQuestionType } from '../common/enum/cdvq/cdvq-question-type.enum';
import { CdvqQuestionStatus } from '../common/enum/cdvq/cdvq-question-status.enum';

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

export class CurrentQuestionResDto {
  @Expose()
  @ApiProperty()
  questionText: string;

  @Expose()
  @ApiProperty()
  type: CdvqQuestionType;

  @Expose()
  @ApiProperty()
  options: string[];

  @Prop({ required: true, type: String, enum: CdvqQuestionStatus, default: CdvqQuestionStatus.WAITING })
  status: CdvqQuestionStatus;
}
