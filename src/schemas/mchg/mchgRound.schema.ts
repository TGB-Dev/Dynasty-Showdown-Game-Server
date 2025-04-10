import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MchgImage, MchgImageSchema } from './mchgImage.schema';
import { MchgQuestion } from './mchgQuestion.schema';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { BaseModel } from '../base.schema';
import mongoose from 'mongoose';
import { UserRole } from '../../common/enum/roles.enum';

@Schema()
export class MchgRound extends BaseModel {
  @ApiProperty({ description: "Round's image", type: 'string', format: 'binary' })
  @Expose({ groups: [UserRole.ADMIN, UserRole.PLAYER] })
  @Prop({ type: MchgImageSchema, required: true })
  @Type(() => MchgImage)
  image: MchgImage;

  @ApiProperty({ description: "Round's questions", type: [MchgQuestion] })
  @ValidateNested({ each: true })
  @Type(() => MchgQuestion)
  @Expose({ groups: [UserRole.ADMIN] })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: MchgQuestion.name }], required: true })
  questions: MchgQuestion[];

  @Expose({ groups: [UserRole.ADMIN] })
  @Prop({ type: mongoose.Types.ObjectId, ref: MchgQuestion.name })
  @Transform((value) => (value.obj as MchgRound).currentQuestion.toString())
  currentQuestion: string;

  @ApiProperty({ description: "Round's order index" })
  @Expose({ groups: [UserRole.ADMIN] })
  @Prop({ required: true })
  order: number;

  @ApiProperty({ description: "Round's main answer" })
  @Expose({ groups: [UserRole.ADMIN] })
  @Prop({ required: true })
  answer: string;
}

export const MchgRoundSchema = SchemaFactory.createForClass(MchgRound);
