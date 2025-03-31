import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CdvqQuestionDocument = HydratedDocument<CdvqQuestion>;

@Schema({ timestamps: true })
export class CdvqQuestion {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  questionText: string;

  @Prop({ required: true, enum: ['multiple-choice', 'short-answer'] })
  type: string;

  @Prop({ type: [String], default: [] })
  options?: string[]; // Just use in case of multiple choice

  @Prop({ required: true })
  answer: string;
}

export const CdvqQuestionSchema = SchemaFactory.createForClass(CdvqQuestion);
