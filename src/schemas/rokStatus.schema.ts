import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RokStatusDocument = HydratedDocument<RokStatus>;

@Schema()
export class RokStatus {
  @Prop({ required: true, unique: true, index: true })
  id: number;

  // The username of the attacking team
  @Prop()
  attackTeam?: string;

  // The username of the defending team
  @Prop()
  defendTeam?: string;

  // The ID of the currently conflicting city
  @Prop({ required: true })
  cityId: number;
}

export const RokStatusSchema = SchemaFactory.createForClass(RokStatus);
