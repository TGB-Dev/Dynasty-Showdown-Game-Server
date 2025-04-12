import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseModel } from '../base.schema';
import { CdvqQuestionType } from '../../common/enum/cdvq/cdvq-question-type.enum';
import { CdvqQuestionStatus } from '../../common/enum/cdvq/cdvq-question-status.enum';

export type CdvqQuestionDocument = HydratedDocument<CdvqQuestion>;

@Schema({ timestamps: true })
export class CdvqQuestion extends BaseModel {
  @Prop({ required: true })
  questionText: string;

  @Prop({ required: true, type: String, enum: CdvqQuestionType })
  type: CdvqQuestionType;

  @Prop({ default: [] })
  options: string[];

  @Prop({ required: true })
  answer: string;

  @Prop({ required: true, type: String, enum: CdvqQuestionStatus, default: CdvqQuestionStatus.WAITING })
  status: CdvqQuestionStatus;
}

export const CdvqQuestionSchema = SchemaFactory.createForClass(CdvqQuestion);
