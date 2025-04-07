import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseModel } from '../base.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, Max, Min } from 'class-validator';

export type RokMatrixDocument = HydratedDocument<RokMatrixState>;

@Schema()
export class RokMatrixState extends BaseModel {
  @ApiProperty({ description: "The city's ID in the range of [0; 81)" })
  @Min(0)
  @Max(81)
  @Prop({ required: true, unique: true, index: true })
  cityId: number;

  @ApiProperty({ description: 'The resource points of the city.' })
  @IsIn([10, 20, 35, 75])
  @Prop({ required: true })
  points: number;

  @ApiProperty({ description: "The owner's username." })
  @Prop()
  owner?: string;
}

export const RokMatrixStateSchema = SchemaFactory.createForClass(RokMatrixState);
