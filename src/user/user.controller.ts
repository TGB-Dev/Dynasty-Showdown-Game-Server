import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Request,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../guards/auth.guard';
import { AuthRequest } from '../common/interfaces/request.interface';
import { GetMeResDto } from '../dtos/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: GetMeResDto,
    excludeExtraneousValues: true,
  })
  getMe(@Request() req: AuthRequest): GetMeResDto {
    return req.user;
  }
}
