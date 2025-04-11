import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel } from '../base.schema';

@Schema()
export class TgoQuestion extends BaseModel {
  @Prop({ required: true })
  questionText: string;

  @Prop({ required: true })
  answer: number;
}

export const TgoQuestionSchema = SchemaFactory.createForClass(TgoQuestion);
