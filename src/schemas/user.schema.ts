import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from '../common/enum/roles.enum';

@Schema()
export class User {
  @Prop({ required: true, index: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  teamName: string;

  @Prop({ required: false, type: String, enum: UserRole, default: UserRole.PLAYER })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
