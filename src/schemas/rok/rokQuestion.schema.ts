import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RokQuestionDocument = HydratedDocument<RokQuestion>;

@Schema()
export class RokQuestion {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true, default: false })
  isMultiple: boolean;

  // If isMultiple = false
  @Prop()
  answer: string;

  // If isMultiple = true
  @Prop({ type: [String] })
  choices: string[];

  @Prop()
  correctChoiceIndex: number;

  @Prop()
  selected: boolean;
}

export const RokQuestionSchema = SchemaFactory.createForClass(RokQuestion);
