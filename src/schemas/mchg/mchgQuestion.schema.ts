import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseModel } from '../base.schema';

@Schema()
export class MchgQuestion extends BaseModel {
  @ApiProperty({ description: "Question's statement" })
  @IsString()
  @IsNotEmpty()
  @Prop({ required: true })
  question: string;

  @ApiProperty({ description: "Question's answer" })
  @IsString()
  @IsNotEmpty()
  @Prop({ required: true })
  answer: string;

  @Prop({ required: true, default: false })
  selected: boolean;

  @Prop({ required: true, default: false })
  solved: boolean;
}

export const MchgQuestionSchema = SchemaFactory.createForClass(MchgQuestion);
