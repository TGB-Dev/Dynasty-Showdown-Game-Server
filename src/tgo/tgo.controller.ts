import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { AttackOpponentDto, GenerateQuestionsDto, QuestionDto, SubmitAnswersDto } from '../dtos/tgo.dto';
import { TgoService } from './tgo.service';
import { AuthRequest } from '../common/interfaces/request.interface';

@Controller('tgo')
export class TgoController {
  constructor(private readonly tgoService: TgoService) {}

  @Get('/questions')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  getAllQuestions() {
    return this.tgoService.getAllQuestions();
  }

  @Get('/questions/current')
  @UseGuards(AuthGuard(UserRole.PLAYER))
  getCurrentQuestion(@Request() { user }: AuthRequest) {
    return this.tgoService.getCurrentQuestions(user.username);
  }

  @Get('/questions/:id')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  getQuestionById(@Param('id') id: string) {
    return this.tgoService.getQuestionById(id);
  }

  @Post('/questions')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  createQuestion(@Body() questionDto: QuestionDto) {
    return this.tgoService.createQuestion(questionDto);
  }

  @Delete('questions/:id')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  deleteQuestion(@Param('id') id: string) {
    return this.tgoService.deleteQuestion(id);
  }

  @Put('questions/:id')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  updateQuestion(@Param('id') id: string, @Body() questionDto: QuestionDto) {
    return this.tgoService.updateQuestion(id, questionDto);
  }

  @Post('/questions/generate')
  @UseGuards(AuthGuard(UserRole.PLAYER))
  generateQuestions(@Request() { user }: AuthRequest, @Body() generateQuestionDto: GenerateQuestionsDto) {
    return this.tgoService.generateQuestions(generateQuestionDto.pack, user.username);
  }

  @Post('/questions/submit')
  @UseGuards(AuthGuard(UserRole.PLAYER))
  submitAnswer(@Request() { user }: AuthRequest, @Body() submitAnswersDto: SubmitAnswersDto) {
    return this.tgoService.submitAnswers(user.username, submitAnswersDto.questionIds);
  }

  @Get('/opponents')
  @UseGuards(AuthGuard(UserRole.PLAYER))
  async getOpponents(@Request() { user }: AuthRequest) {
    return {
      opponents: await this.tgoService.getOpponents(user.username),
    };
  }

  @Post('/opponents/attack')
  @UseGuards(AuthGuard(UserRole.PLAYER))
  attackOpponent(@Request() { user }: AuthRequest, @Body() attackOpponentDto: AttackOpponentDto) {
    return this.tgoService.attackOpponent(user.username, attackOpponentDto.username);
  }

  @Get('/opponents/can-attack')
  @UseGuards(AuthGuard(UserRole.PLAYER))
  async canAttackOpponent(@Request() { user }: AuthRequest) {
    return {
      canAttack: await this.tgoService.canAttack(user.username),
    };
  }

  @Post('/game/start')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  startGame() {
    return this.tgoService.startGame();
  }

  @Post('/game/stop')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  stopGame() {
    return this.tgoService.stopGame();
  }

  @Post('/game/pause')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  pauseGame() {
    return this.tgoService.pauseGame();
  }

  @Post('/game/resume')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  resumeGame() {
    return this.tgoService.resumeGame();
  }
}
