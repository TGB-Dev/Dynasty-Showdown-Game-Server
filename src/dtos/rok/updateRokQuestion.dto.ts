import { PartialType } from '@nestjs/swagger';
import { NewRokQuestionDto } from './newRokQuestion.dto';

export class UpdateRokQuestionDto extends PartialType(NewRokQuestionDto) {}
