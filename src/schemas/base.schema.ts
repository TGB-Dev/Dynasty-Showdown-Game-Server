import mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export abstract class BaseModel {
  @ApiProperty({ description: 'The unique identifier of the document' })
  @Expose()
  @Transform((value) => (value.obj as BaseModel)._id?.toString())
  _id?: mongoose.Types.ObjectId;
}
