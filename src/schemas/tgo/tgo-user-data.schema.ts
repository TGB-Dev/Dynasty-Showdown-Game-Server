import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel } from '../base.schema';

@Schema()
export class TgoUserData extends BaseModel {
  @Prop({ required: true })
  username: string;

  @Prop({ default: [] })
  chosenQuestions: string[]; // Array of question IDs

  @Prop({
    default: {
      questions: [],
      answers: [],
    },
    type: {
      questions: [
        {
          id: String,
          questionText: String,
        },
      ],
      answers: [Number],
    },
  })
  currentQuestions: {
    questions: {
      id: string;
      questionText: string;
    }[]; // Array of question IDs;
    answers: number[]; // Array of sorted answers and it is not corresponding to the question ID
  };

  @Prop({ default: 0 })
  attackScore: number;
}

export const TgoUserDataSchema = SchemaFactory.createForClass(TgoUserData);
