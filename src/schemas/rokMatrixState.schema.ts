import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RokMatrixDocument = HydratedDocument<RokMatrixState>;

@Schema()
export class RokMatrixState {
  // The city ID
  @Prop({ required: true, unique: true, index: true })
  cityId: number;

  // The resource points of the city
  @Prop({ required: true })
  points: number;

  // The username of the owner
  @Prop()
  owner?: string;
}

export const RokMatrixStateSchema = SchemaFactory.createForClass(RokMatrixState);
