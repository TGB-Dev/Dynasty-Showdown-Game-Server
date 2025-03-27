import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from '../dtos/signup.dto';
import { SigninDto } from '../dtos/signin.dto';
import { AuthorizationDto } from '../dtos/authorization.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signIn')
  @ApiResponse({ status: '2XX', type: SignupDto })
  @ApiResponse({ status: '4XX', description: 'When the user credentials are invalid.' })
  async signIn(@Body() user: SigninDto): Promise<AuthorizationDto> {
    return await this.authService.signIn(user);
  }
}
