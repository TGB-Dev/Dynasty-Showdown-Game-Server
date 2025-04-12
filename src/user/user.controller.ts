import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Request,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../guards/auth.guard';
import { AuthRequest } from '../common/interfaces/request.interface';
import { GetMeResDto, UpdateUserScoreReqDto } from '../dtos/user.dto';
import { UserRole } from '../common/enum/roles.enum';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User } from '../schemas/user.schema';

@ApiBearerAuth()
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

  @Post('score')
  @ApiCreatedResponse({ description: 'Score updated successfully', type: () => User })
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  @UseGuards(AuthGuard(UserRole.ADMIN))
  updateUserScore(@Body() body: UpdateUserScoreReqDto) {
    return this.userService.updateScore(body.user_id, body.action, body.score);
  }
}
