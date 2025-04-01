import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { RokService } from './rok.service';
import { NewQuestionDto } from '../dtos/newQuestion.dto';
import { UpdateQuestionDto } from '../dtos/updateQuestion.dto';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { RokRepository } from './rok.repository';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('rok')
export class RokController {
  constructor(
    private readonly rokService: RokService,
    private readonly rokRepository: RokRepository,
  ) {}

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('start')
  startGame() {}

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('stop')
  stopGame() {}

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('startRound')
  startRound() {}

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('stopRound')
  stopRound() {}

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('startTimer')
  startTimer() {}

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('stopTimer')
  stopTimer() {}

  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Get('claimCity')
  claimCity() {}

  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Get('unclaimCity')
  unclaimCity() {}

  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Get('attackCity')
  attackCity() {}

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Post('questions/create')
  async createQuestion(@Body() newQuestion: NewQuestionDto) {
    return await this.rokRepository.createQuestion(newQuestion);
  }

  @UseGuards(AuthGuard())
  @Get('questions')
  async getQuestions() {
    return await this.rokRepository.getQuestions();
  }

  @UseGuards(AuthGuard())
  @Get('questions/:id')
  async getQuestionById(@Param('id') id: string) {
    return await this.rokRepository.getQuestionById(id);
  }

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Put('questions/:id')
  async updateQuestion(@Param('id') id: string, @Body() updates: UpdateQuestionDto) {
    return await this.rokRepository.updateQuestion(id, updates);
  }

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return await this.rokRepository.deleteQuestion(id);
  }
}
