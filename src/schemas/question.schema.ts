import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema()
export class Question {
  @Prop({ required: true })
  gameId: number;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  isMultipleChoice: boolean;

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ type: [String] })
  choices: string[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
