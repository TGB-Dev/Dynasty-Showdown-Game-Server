import { ObjectId } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class BaseModel {
  @ApiProperty({ description: 'The unique identifier of the document' })
  _id?: ObjectId;
}
