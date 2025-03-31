import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CdvqTeamDocument = HydratedDocument<CdvqTeam>;

@Schema({ timestamps: true })
export class CdvqTeam {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 0 })
  score: number;
}

export const CdvqTeamSchema = SchemaFactory.createForClass(CdvqTeam);
