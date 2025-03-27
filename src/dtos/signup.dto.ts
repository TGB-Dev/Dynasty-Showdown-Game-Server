import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  teamName: string;
}
