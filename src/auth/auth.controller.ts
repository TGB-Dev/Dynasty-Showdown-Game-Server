import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from '@nestjs/swagger';
import { SignInReqDto, SignInResDto } from '../dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signIn')
  @ApiResponse({ status: '2XX', type: SignInResDto })
  @ApiResponse({ status: '4XX', description: 'When the user credentials are invalid.' })
  async signIn(@Body() user: SignInReqDto): Promise<SignInResDto> {
    console.log(user);
    return await this.authService.signIn(user);
  }
}
