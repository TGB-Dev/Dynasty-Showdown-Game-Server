import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../user.schema';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class MchgMainQuestionQueue {
  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: User.name })
  user: User;

  @Prop({ required: true, default: false })
  selected: boolean;
}

export const MchgMainQuestionQueueSchema = SchemaFactory.createForClass(MchgMainQuestionQueue);
