import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { RokService } from './rok.service';
import { NewRokQuestionDto, RokAnswerQuestionDto, SendRokQuestionDto, UpdateRokQuestionDto } from '../dtos/rok.dto';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthRequest } from '../common/interfaces/request.interface';

@ApiTags('Rise of Kingdom')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 200, description: 'OK.' })
@ApiResponse({ status: 500, description: 'Internal Server Error.' })
@Controller('rok')
export class RokController {
  constructor(private readonly rokService: RokService) {}

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

  @ApiOperation({ summary: 'Increase the number of rounds.' })
  @Get('round/increase')
  increaseRoundCount() {
    this.rokService.increaseRoundCount();
  }

  @ApiOperation({ summary: 'Decrease the number of rounds.' })
  @Get('round/decrease')
  decreaseRoundCount() {
    this.rokService.decreaseRoundCount();
  }

  @ApiOperation({ summary: 'Get the number of rounds.' })
  @Get('round/count')
  getRoundCount() {
    return this.rokService.getRoundCount();
  }

  @ApiOperation({ summary: 'Select `cityId` for attack.' })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Get('city/select/:cityId')
  async selectCity(@Param('cityId') cityId: number, @Request() req: AuthRequest) {
    await this.rokService.selectCity(req.user.username, cityId);
  }

  @ApiOperation({ summary: 'Deselect `cityId` for attack.' })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Get('city/deselect/:cityId')
  async deselectCity(@Param('cityId') cityId: number, @Request() req: AuthRequest) {
    await this.rokService.deselectCity(req.user.username, cityId);
  }

  @ApiOperation({ summary: 'Get attacks of the current round.' })
  @UseGuards(AuthGuard())
  @Get('attacks')
  async getAttacks() {
    await this.rokService.getAttacks();
  }

  @ApiOperation({ summary: 'Get the current question.' })
  @ApiOkResponse({ description: 'OK.', type: SendRokQuestionDto })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Get('questions/current')
  async getCurrentQuestion() {
    return await this.rokService.getCurrentQuestion();
  }

  @ApiOperation({ summary: 'Answer the question with `questionId`.' })
  @ApiResponse({ status: 201, description: 'OK (POST).' })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  @Post('questions/answer')
  async answerQuestion(@Request() req: AuthRequest, @Body() dto: RokAnswerQuestionDto) {
    await this.rokService.answerQuestion(req.user.username, dto);
  }

  @ApiOperation({ summary: 'Create a new question.' })
  @ApiResponse({ status: 201, description: 'OK (POST).' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Post('questions/create')
  async createQuestion(@Body() newQuestion: NewRokQuestionDto) {
    return await this.rokService.createQuestion(newQuestion);
  }

  @ApiOperation({ summary: 'Get all available questions.' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Get('questions')
  async getQuestions() {
    return await this.rokService.getQuestions();
  }

  @ApiOperation({ summary: 'Get question by `id`.' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
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

  @Get('users/is-attacking')
  @UseGuards(AuthGuard(UserRole.PLAYER))
  async isAttacking(@Request() req: AuthRequest) {
    return await this.rokService.checkInAttackingTeams(req.user.username);
  }

  @Get('users/is-defending')
  @UseGuards(AuthGuard(UserRole.PLAYER))
  async isDefending(@Request() req: AuthRequest) {
    return await this.rokService.checkInDefendingTeams(req.user.username);
  }

  @ApiOperation({ summary: 'Get the matrix' })
  @UseGuards(AuthGuard())
  @Get('matrix')
  async getMatrix() {
    return await this.rokService.getMatrix();
  }

  @ApiOperation({ summary: 'Get current game stage.' })
  @UseGuards(AuthGuard())
  @Get('currentStage')
  getCurrentStage() {
    return this.rokService.getCurrentStage();
  }
}
