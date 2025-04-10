import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseModel } from '../base.schema';
import { Expose, Transform } from 'class-transformer';
import { UserRole } from '../../common/enum/roles.enum';
import mongoose from 'mongoose';

@Schema()
export class MchgQuestion extends BaseModel {
  @Expose({ groups: [UserRole.ADMIN] })
  @Transform(({ obj }) => (obj as MchgQuestion)._id.toString())
  declare _id: mongoose.Types.ObjectId;

  @ApiProperty({ description: "Question's statement" })
  @IsString()
  @IsNotEmpty()
  @Prop({ required: true })
  @Expose({ groups: [UserRole.ADMIN, UserRole.PLAYER] })
  question: string;

  @ApiProperty({ description: "Question's answer" })
  @IsString()
  @IsNotEmpty()
  @Prop({ required: true })
  @Expose({ groups: [UserRole.ADMIN] })
  answer: string;

  @Prop({ required: true, default: false })
  @Expose({ groups: [UserRole.ADMIN] })
  selected: boolean;

  @Prop({ required: true, default: false })
  @Expose({ groups: [UserRole.ADMIN] })
  solved: boolean;
}

export const MchgQuestionSchema = SchemaFactory.createForClass(MchgQuestion);
