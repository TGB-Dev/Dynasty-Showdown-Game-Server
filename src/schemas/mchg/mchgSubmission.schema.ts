import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../user.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MchgQuestion } from './mchgQuestion.schema';
import { BaseModel } from '../base.schema';

@Schema()
export class MchgSubmission extends BaseModel {
  @ApiProperty({ description: 'Submitted user' })
  @Type(() => User)
  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: User.name })
  user: User;

  @ApiProperty({ description: 'Submitted answer' })
  @Prop({ required: true })
  answer: string;

  @ApiProperty({ description: "Submission's question" })
  @Type(() => MchgQuestion)
  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: MchgQuestion.name })
  question: MchgQuestion;
}

export const MchgSubmissionSchema = SchemaFactory.createForClass(MchgSubmission);
