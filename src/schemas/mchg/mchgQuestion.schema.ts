import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseModel } from '../base.schema';
import { Expose } from 'class-transformer';
import { UserRole } from '../../common/enum/roles.enum';

@Schema()
export class MchgQuestion extends BaseModel {
  @ApiProperty({ description: "Question's statement" })
  @IsString()
  @IsNotEmpty()
  @Prop({ required: true })
  @Expose({ groups: [UserRole.ADMIN, UserRole.PLAYER] })
  question: string;

  @ApiProperty({ description: "Question's answer" })
  @IsString()
  @IsNotEmpty()
  @Prop({ required: true })
  @Expose({ groups: [UserRole.ADMIN] })
  answer: string;

  @Prop({ required: true, default: false })
  @Expose({ groups: [UserRole.ADMIN] })
  selected: boolean;

  @Prop({ required: true, default: false })
  @Expose({ groups: [UserRole.ADMIN] })
  solved: boolean;
}

export const MchgQuestionSchema = SchemaFactory.createForClass(MchgQuestion);
