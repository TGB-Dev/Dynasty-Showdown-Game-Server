import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RokAttackDocument = HydratedDocument<RokAttack>;

// The attack states should be pushed into a queue then processed later because the defending
// stage happens after the attacking stage.
@Schema()
export class RokAttack {
  // The username of the attacking team
  @Prop()
  attackTeam: string;

  // The ID of the currently conflicting city
  @Prop({ required: true, index: true, unique: true })
  cityId: number;

  @Prop({ default: false })
  answered: boolean;
}

export const RokAttackSchema = SchemaFactory.createForClass(RokAttack);
