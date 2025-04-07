import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';
import { BaseModel } from '../base.schema';
import { CdvqQuestionType } from '../../common/enum/cdvq-question-type.enum';
import { CdvqQuestionStatus } from '../../common/enum/cdvq-question-status.enum';

export type CdvqQuestionDocument = HydratedDocument<CdvqQuestion>;

@Schema({ timestamps: true })
export class CdvqQuestion extends BaseModel {
  @Prop({ required: true, default: () => randomUUID(), primary: true, unique: true })
  id: string;

  @Prop({ required: true })
  questionText: string;

  @Prop({ required: true })
  type: CdvqQuestionType;

  @Prop({ type: [String], default: [] })
  options?: string[]; // Just use in case of multiple choice

  @Prop({ required: true })
  answer: string;

  @Prop({ required: true, default: () => Date.now() })
  startTime: Date;

  @Prop({ required: true, enum: ['waiting', 'completed'], default: CdvqQuestionStatus.WAITING })
  status: CdvqQuestionStatus;
}

export const CdvqQuestionSchema = SchemaFactory.createForClass(CdvqQuestion);
