import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MchgImage, MchgImageSchema } from './mchgImage.schema';
import { MchgQuestion } from './mchgQuestion.schema';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseModel } from '../base.schema';
import mongoose from 'mongoose';

@Schema()
export class MchgRound extends BaseModel {
  @ApiProperty({ description: "Round's image", type: 'string', format: 'binary' })
  @Prop({ type: MchgImageSchema, required: true })
  image: MchgImage;

  @ApiProperty({ description: "Round's questions", type: [MchgQuestion] })
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => MchgQuestion)
  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: MchgQuestion.name }], required: true })
  questions: MchgQuestion[];

  @Prop({ type: mongoose.Types.ObjectId, ref: MchgQuestion.name })
  currentQuestion: string;

  @ApiProperty({ description: "Round's order index" })
  @Prop({ required: true })
  order: number;

  @ApiProperty({ description: "Round's main answer" })
  @Prop({ required: true })
  answer: string;
}

export const MchgRoundSchema = SchemaFactory.createForClass(MchgRound);
