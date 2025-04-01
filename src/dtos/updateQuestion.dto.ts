import { PartialType } from '@nestjs/swagger';
import { NewQuestionDto } from './newQuestion.dto';

export class UpdateQuestionDto extends PartialType(NewQuestionDto) {}
