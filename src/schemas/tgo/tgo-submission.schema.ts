import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel } from '../base.schema';

@Schema()
export class TgoSubmission extends BaseModel {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  answers: {
    questionId: string;
    answer: number;
  }[];

  @Prop({ required: true })
  correct: boolean;
}

export const TgoSubmissionSchema = SchemaFactory.createForClass(TgoSubmission);
