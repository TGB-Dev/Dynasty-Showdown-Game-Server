import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';
export type CdvqQuestionDocument = HydratedDocument<CdvqQuestion>;

@Schema({ timestamps: true })
export class CdvqQuestion {
  @Prop({ required: true, default: () => randomUUID(), primary: true, unique: true })
  id: string;

  @Prop({ required: true })
  questionText: string;

  @Prop({ required: true, enum: ['multiple-choice', 'short-answer'] })
  type: string;

  @Prop({ type: [String], default: [] })
  options?: string[]; // Just use in case of multiple choice

  @Prop({ required: true })
  answer: string;

  @Prop({ required: true, default: () => Date.now() })
  startTime: Date;

  @Prop({ required: true, enum: ['waiting', 'completed'], default: 'waiting' })
  status: 'waiting' | 'completed';
}

export const CdvqQuestionSchema = SchemaFactory.createForClass(CdvqQuestion);
