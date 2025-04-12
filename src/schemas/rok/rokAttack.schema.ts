import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseModel } from '../base.schema';
import { ApiProperty } from '@nestjs/swagger';

export type RokAttackDocument = HydratedDocument<RokAttack>;

// The attack states should be pushed into a queue then processed later because the defending
// stage happens after the attacking stage.
@Schema()
export class RokAttack extends BaseModel {
  @ApiProperty({ description: "The attacker's username." })
  @Prop()
  attackTeam: string;

  @ApiProperty({ description: "The targeted city's ID." })
  @Prop({ required: true, index: true, unique: true })
  cityId: number;

  @ApiProperty({ description: 'Whether the challenge question is answered or not.' })
  @Prop({ default: false })
  answered: boolean;
}

export const RokAttackSchema = SchemaFactory.createForClass(RokAttack);
