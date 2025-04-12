import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseModel } from '../base.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Min } from 'class-validator';

export type RokQuestionDocument = HydratedDocument<RokQuestion>;

@Schema()
export class RokQuestion extends BaseModel {
  @ApiProperty({ description: 'The question.' })
  @Prop({ required: true })
  question: string;

  @Prop({ required: true, default: false })
  isMultiple: boolean;

  @ApiProperty({ description: 'Required if `isMultiple = false`' })
  @Prop({
    // @ts-expect-error `this` should be specified
    required: () => !this.isMultiple,
  })
  answer?: string;

  @ApiProperty({ description: 'Required if `isMultiple = true`' })
  @Prop({
    type: [String],
    // @ts-expect-error `this` should be specified
    required: () => this.isMultiple === true,
  })
  choices?: string[];

  @ApiProperty({ description: 'Required if `isMultiple = true`' })
  @Prop({
    // @ts-expect-error `this` should be specified
    required: () => this.isMultiple === true,
  })
  @Min(0)
  correctChoiceIndex?: number;

  @ApiProperty({ description: 'Whether the question is already chosen or not.' })
  @Prop({ default: false })
  selected: boolean;

  @ApiProperty({ description: 'The round in which this question is selected.' })
  @Prop({
    // @ts-expect-error `this` should be specified
    required: () => this.selected === true,
  })
  round?: number;
}

export const RokQuestionSchema = SchemaFactory.createForClass(RokQuestion);
