import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseModel } from '../base.schema';

export type CdvqScoreRecordDocument = HydratedDocument<CdvqScore>;

@Schema({ timestamps: true })
export class CdvqScore extends BaseModel {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  questionId: string;

  @Prop({ required: true })
  roundNumber: number;

  @Prop({ required: true })
  isCorrect: boolean;

  @Prop({ required: true, default: 0 })
  answerTime: number;
}

export const CdvqScoreSchema = SchemaFactory.createForClass(CdvqScore);
