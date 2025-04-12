import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel } from '../base.schema';

@Schema()
export class TgoUserData extends BaseModel {
  @Prop({ required: true })
  username: string;

  @Prop({ default: [] })
  chosenQuestions: string[]; // Array of question IDs

  @Prop({
    default: [],
    type: [{ questionId: String, questionText: String }],
  })
  currentQuestions: CurrentQuestion[]; // Array of question IDs

  @Prop({ default: 0 })
  attackScore: number;

  @Prop({ required: true })
  currentRound: number;

  @Prop({ default: false })
  canAttack: boolean;
}

export const TgoUserDataSchema = SchemaFactory.createForClass(TgoUserData);
