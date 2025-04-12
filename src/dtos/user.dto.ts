import { UserRole } from '../common/enum/roles.enum';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsHexadecimal, IsIn, IsNumber, Length } from 'class-validator';

export class GetMeResDto {
  @Expose()
  username: string;

  @Expose()
  role: UserRole;
}

export class UpdateUserScoreReqDto {
  @ApiProperty({ enum: ['set', 'inc'], description: 'Action type' })
  @IsIn(['set', 'inc'])
  action: 'set' | 'inc';

  @ApiProperty()
  @IsHexadecimal()
  @Length(24, 24)
  user_id: string;

  @ApiProperty()
  @IsNumber()
  score: number;
}

export class LeaderboardDto {
  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  @Expose()
  score: number;
}
