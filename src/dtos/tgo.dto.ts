import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TgoQuestionPack } from '../common/enum/tgo/tgo-question-pack.enum';

export class QuestionDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({ required: true })
  @IsNumber()
  answer: number;
}

export class GenerateQuestionsDto {
  @ApiProperty({ required: true })
  @IsEnum(TgoQuestionPack, { message: 'Question pack must be between 3, 5 and 7' })
  pack: TgoQuestionPack;
}

export class SubmitAnswersDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  answer: number;
}

export class AttackOpponentDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  username: string;
}
