import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class MchgMainQuestionQueue {
  @Prop({ required: true })
  teamUsername: string;

  @Prop({ unique: true, required: true })
  timestamp: number;
}

export const MchgMainQuestionQueueSchema = SchemaFactory.createForClass(MchgMainQuestionQueue);
