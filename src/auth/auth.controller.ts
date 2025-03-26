import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from '../dtos/signup.dto';
import { SigninDto } from '../dtos/signin.dto';
import { AuthorizationDto } from '../dtos/authorization.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from '../guards/jwt/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiResponse({ status: '2XX', type: SignupDto })
  @ApiResponse({ status: '4XX', description: 'When the user already exists or the credentials are invalid.' })
  async signup(@Body() newUser: SignupDto): Promise<AuthorizationDto> {
    return this.authService.signup(newUser);
  }

  @Post('signin')
  @ApiResponse({ status: '2XX', type: SignupDto })
  @ApiResponse({ status: '4XX', description: 'When the user credentials are invalid.' })
  async signin(@Body() user: SigninDto): Promise<AuthorizationDto> {
    return await this.authService.signin(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Request() req: Request & { user: { sub: string; iat: number } }) {
    return this.authService.getUserProfile(req.user.sub);
  }
}
