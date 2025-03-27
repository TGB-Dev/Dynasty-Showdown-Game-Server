import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../schemas/user.schema';
import { AuthRequest } from '../common/interfaces/request.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard())
  getMe(@Request() req: AuthRequest): User {
    return req.user;
  }
}
