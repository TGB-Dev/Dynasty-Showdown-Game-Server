import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel } from '../base.schema';
import mongoose from 'mongoose';
import { CdvqQuestion } from './cdvq-question.schema';
import { User } from '../user.schema';

@Schema({ timestamps: true })
export class CdvqSubmission extends BaseModel {
  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: CdvqQuestion.name })
  question: CdvqQuestion;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: User.name })
  user: User;

  @Prop({ required: true })
  answer: string;

  @Prop({ required: true, default: false })
  isCorrect: boolean;

  @Prop({ required: true, default: 0 })
  score: number;
}

export const CdvqSubmissionSchema = SchemaFactory.createForClass(CdvqSubmission);
