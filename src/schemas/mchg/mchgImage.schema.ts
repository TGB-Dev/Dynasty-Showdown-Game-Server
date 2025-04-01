import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseModel } from '../base.schema';

export type MchgImageDocument = HydratedDocument<MchgImage>;

@Schema()
export class MchgImage extends BaseModel {
  @Prop({ required: true, unique: true })
  name: string;
}

export const MchgImageSchema = SchemaFactory.createForClass(MchgImage);
