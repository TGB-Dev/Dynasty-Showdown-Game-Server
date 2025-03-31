import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CdvqStatusDocument = HydratedDocument<CdvqStatus>;
@Schema({ timestamps: true })
export class CdvqStatus {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ type: [String], required: true })
  teams: string[];

  @Prop({ required: true, default: 1 })
  currentRound: number;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: Map, of: Number, default: {} })
  scores: Map<string, number>;
}

export const CdvqStatusSchema = SchemaFactory.createForClass(CdvqStatus);
