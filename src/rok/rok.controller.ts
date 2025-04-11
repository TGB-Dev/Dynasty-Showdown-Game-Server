import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { RokService } from './rok.service';
import { NewRokQuestionDto, RokAnswerQuestionDto, UpdateRokQuestionDto } from '../dtos/rok.dto';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthRequest } from '../common/interfaces/request.interface';
import { RokGateway } from './rok.gateway';

@ApiTags('Rise of Kingdom')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 200, description: 'OK.' })
@ApiResponse({ status: 500, description: 'Internal Server Error.' })
@Controller('rok')
export class RokController {
  constructor(
    private readonly rokService: RokService,
    private readonly rokGateway: RokGateway,
  ) {}

  @ApiOperation({ summary: 'Resume the game.' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('game/resume')
  resumeGame() {
    this.rokService.resumeGame();
  }

  @ApiOperation({
    summary:
      'Run the game (with a "3 2 1" timer). The game will emit the `endGame` event after all rounds are finished.`',
  })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('game/run')
  runRound() {
    return this.rokService.runGame();
  }

  @ApiOperation({ summary: 'Pause the game.' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('game/pause')
  pauseGame() {
    return this.rokService.pauseGame();
  }

  @ApiOperation({ summary: 'Start the internal timer.' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('timer/start/:duration')
  async startTimer(@Param('duration') durationInSeconds: number) {
    await this.rokService.startTimer(durationInSeconds, (rem) => this.rokGateway.updateTimer(rem));
  }

  @ApiOperation({ summary: 'End the internal timer.' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('timer/stop')
  stopTimer() {
    return this.rokService.stopTimer();
  }

  @ApiOperation({ summary: 'Create an attack on `cityId`.' })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Get('attack/create/:cityId')
  async createAttack(@Param('cityId') cityId: number, @Request() req: AuthRequest) {
    await this.rokService.createAttack(req.user.username, cityId);
  }

  @ApiOperation({ summary: 'Delete an attack on `cityId`.' })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Get('attack/remove/:cityId')
  async deleteAttack(@Param('cityId') cityId: number, @Request() req: AuthRequest) {
    await this.rokService.deleteAttack(req.user.username, cityId);
  }

  @ApiOperation({ summary: 'Get attacks of the current round.' })
  @UseGuards(AuthGuard())
  @Get('attacks')
  async getAttacks() {
    await this.rokService.getAttacks();
  }

  @ApiOperation({ summary: 'Answer the question with `questionId`.' })
  @ApiResponse({ status: 201, description: 'OK (POST).' })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Post('questions/answer/:questionId')
  async answerQuestion(
    @Param('questionId') questionId: string,
    @Request() req: AuthRequest,
    @Body() dto: RokAnswerQuestionDto,
  ) {
    await this.rokService.answerQuestion(questionId, req.user.username, dto);
  }

  @ApiOperation({ summary: 'Create a new question.' })
  @ApiResponse({ status: 201, description: 'OK (POST).' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Post('questions/create')
  async createQuestion(@Body() newQuestion: NewRokQuestionDto) {
    return await this.rokService.createQuestion(newQuestion);
  }

  @ApiOperation({ summary: 'Get all available questions.' })
  @UseGuards(AuthGuard())
  @Get('questions')
  async getQuestions() {
    return await this.rokService.getQuestions();
  }

  @ApiOperation({ summary: 'Get question by `id`.' })
  @UseGuards(AuthGuard())
  @Get('questions/:id')
  async getQuestionById(@Param('id') id: string) {
    return await this.rokService.getQuestionById(id);
  }

  @ApiOperation({ summary: 'Update question with `id`.' })
  @ApiResponse({ status: 404, description: 'When the question with specified `id` is not found.' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Put('questions/:id')
  async updateQuestion(@Param('id') id: string, @Body() updates: UpdateRokQuestionDto) {
    return await this.rokService.updateQuestion(id, updates);
  }

  @ApiOperation({ summary: 'Delete question with `id`.' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return await this.rokService.deleteQuestion(id);
  }

  @ApiOperation({ summary: 'Get the matrix' })
  @UseGuards(AuthGuard())
  @Get('matrix')
  async getMatrix() {
    return await this.rokService.getMatrix();
  }
}
