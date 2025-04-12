import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from '../common/enum/roles.enum';
import { BaseModel } from './base.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class User extends BaseModel {
  @ApiProperty()
  @Prop({ required: true, index: true, unique: true })
  username: string;

  @ApiProperty()
  @Prop({ required: true })
  password: string;

  @ApiProperty({ enum: UserRole })
  @Prop({ required: false, type: String, enum: UserRole, default: UserRole.PLAYER })
  role: UserRole;

  @ApiProperty()
  @Prop({ required: true, default: 0 })
  score: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
