import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

export type UserRole = 'player' | 'publicView' | 'admin';

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  teamName: string;

  @Prop({ required: false, type: String, enum: ['player', 'publicView', 'admin'], default: 'user' })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
