import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DbUserDocument = HydratedDocument<DbUser>;

@Schema()
export class DbUser {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  teamName: string;
}

export const DbUserSchema = SchemaFactory.createForClass(DbUser);
