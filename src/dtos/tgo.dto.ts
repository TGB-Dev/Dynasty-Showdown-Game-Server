import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
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
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsMongoId({ each: true })
  questionIds: string[];
}

export class AttackOpponentDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  username: string;
}
