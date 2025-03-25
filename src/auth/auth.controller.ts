import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from '../dtos/signup.dto';
import { SigninDto } from '../dtos/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() newUser: SignupDto) {
    return await this.authService.signup(newUser);
  }

  @Post('signin')
  async signin(@Body() user: SigninDto) {
    return await this.authService.signin(user);
  }
}
