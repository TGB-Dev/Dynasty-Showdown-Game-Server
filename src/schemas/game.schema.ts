import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Room } from '../common/enum/room.enum';

@Schema()
export class Game {
  @Prop({ required: true, unique: true, enum: Room })
  game: Room;

  @Prop({ default: false })
  running: boolean;

  @Prop({ default: false })
  started: boolean;
}

export const GameSchema = SchemaFactory.createForClass(Game);
