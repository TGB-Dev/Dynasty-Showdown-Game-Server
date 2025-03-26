import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  teamName: string;

  @Prop({ required: false, type: String, enum: ['Normal', 'PublicView', 'Admin'], default: 'Normal' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
