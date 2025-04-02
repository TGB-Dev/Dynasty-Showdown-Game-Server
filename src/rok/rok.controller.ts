import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { RokService } from './rok.service';
import { NewRokQuestionDto } from '../dtos/newRokQuestion.dto';
import { UpdateRokQuestionDto } from '../dtos/updateRokQuestion.dto';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { RokRepository } from './rok.repository';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RokAnswerQuestionDto } from '../dtos/rokAnswerQuestion.dto';
import { AuthRequest } from '../common/interfaces/request.interface';
import { RokGateway } from './rok.gateway';

@ApiBearerAuth()
@Controller('rok')
export class RokController {
  constructor(
    private readonly rokService: RokService,
    private readonly rokRepository: RokRepository,
    private readonly rokGateway: RokGateway,
  ) {}

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('game/resume')
  async resumeGame() {
    return await this.rokService.resumeGame();
  }

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('game/run')
  runRound() {
    return this.rokService.runGame();
  }

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('game/pause')
  pauseGame() {
    return this.rokService.pauseGame();
  }

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('timer/start/:duration')
  async startTimer(@Param('duration') durationInSeconds: number) {
    await this.rokService.startTimer(durationInSeconds, (rem) => this.rokGateway.updateTimer(rem));
  }

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('timer/stop')
  stopTimer() {
    return this.rokService.stopTimer();
  }

  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Get('attack/create/:cityId')
  async createAttack(@Param('cityId') cityId: number, @Request() req: AuthRequest) {
    await this.rokRepository.createAttack(req.user.username, cityId);
  }

  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Get('attack/remove/:cityId')
  async deleteAttack(@Param('cityId') cityId: number, @Request() req: AuthRequest) {
    await this.rokRepository.deleteAttack(req.user.username, cityId);
  }

  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Get('questions/answer/:questionId')
  async answerQuestion(
    @Param('questionId') questionId: string,
    @Request() req: AuthRequest,
    @Body() dto: RokAnswerQuestionDto,
  ) {
    await this.rokService.answerQuestion(questionId, req.user.username, dto);
  }

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Post('questions/create')
  async createQuestion(@Body() newQuestion: NewRokQuestionDto) {
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
  async updateQuestion(@Param('id') id: string, @Body() updates: UpdateRokQuestionDto) {
    return await this.rokRepository.updateQuestion(id, updates);
  }

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return await this.rokRepository.deleteQuestion(id);
  }
}
