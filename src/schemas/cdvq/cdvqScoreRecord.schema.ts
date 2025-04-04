import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CdvqScoreRecordDocument = HydratedDocument<CdvqScoreRecord>;

@Schema({ timestamps: true })
export class CdvqScoreRecord {
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

export const CdvqScoreRecordSchema = SchemaFactory.createForClass(CdvqScoreRecord);
