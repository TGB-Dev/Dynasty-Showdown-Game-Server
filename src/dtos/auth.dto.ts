import { ApiProperty } from '@nestjs/swagger';

export class SignInReqDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}

export class SignInResDto {
  accessToken: string;
}
