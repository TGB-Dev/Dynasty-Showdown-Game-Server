import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { CurrentQuestionResDto, QuestionDto } from '../dtos/cdvq.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvq-question.schema';
import { CdvqService } from './cdvq.service';
import { AuthRequest } from '../common/interfaces/request.interface';

@ApiBearerAuth()
@Controller('cdvq')
export class CdvqController {
  constructor(private readonly cdvqService: CdvqService) {}

  @Get('questions/current')
  @UseGuards(AuthGuard(UserRole.PLAYER, UserRole.ADMIN))
  @ApiOperation({ summary: 'Get current question' })
  @ApiResponse({ status: 200, description: 'Current question retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Current question retrieval failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: CurrentQuestionResDto, excludeExtraneousValues: true })
  getCurrentQuestion() {
    return this.cdvqService.getCurrentQuestion();
  }

  @Get('questions')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Get all questions' })
  @ApiResponse({ status: 200, description: 'Returns list of questions', type: [CdvqQuestion] })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllQuestions(): Promise<CdvqQuestion[]> {
    return await this.cdvqService.getQuestions();
  }

  @Post('questions')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiBody({ type: QuestionDto })
  createQuestion(@Body() questionDto: QuestionDto) {
    return this.cdvqService.createQuestion(questionDto);
  }

  @Delete('questions/:id')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Delete a question by ID' })
  @ApiParam({ name: 'id', required: true, description: 'MongoDB _id of the question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  deleteQuestion(@Param('id') id: string) {
    return this.cdvqService.deleteQuestion(id);
  }

  @Put('questions/:id')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Update a question by ID' })
  @ApiParam({ name: 'id', required: true, description: 'MongoDB _id of the question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiBody({ type: QuestionDto })
  updateQuestion(@Param('id') id: string, @Body() questionDto: QuestionDto) {
    return this.cdvqService.updateQuestion(id, questionDto);
  }

  @Post('game/start')
  @ApiOperation({ summary: 'Start game' })
  @ApiResponse({ status: 201, description: 'Game started successfully' })
  @ApiResponse({ status: 400, description: 'Game started failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  startGame() {
    return this.cdvqService.startGame();
  }

  @Post('game/stop')
  @ApiOperation({ summary: 'Stop game' })
  @ApiResponse({ status: 201, description: 'Game stopped successfully' })
  @ApiResponse({ status: 400, description: 'Game stopped failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  stopGame() {
    return this.cdvqService.stopGame();
  }

  @Post('game/pause')
  @ApiOperation({ summary: 'Pause game' })
  @ApiResponse({ status: 201, description: 'Game paused successfully' })
  @ApiResponse({ status: 400, description: 'Game paused failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  pauseGame() {
    return this.cdvqService.pauseGame();
  }

  @Post('game/resume')
  @ApiOperation({ summary: 'Resume game' })
  @ApiResponse({ status: 201, description: 'Game resumed successfully' })
  @ApiResponse({ status: 400, description: 'Game resumed failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  resumeGame() {
    return this.cdvqService.resumeGame();
  }

  @Get('game/answer')
  @UseGuards(AuthGuard(UserRole.PLAYER, UserRole.ADMIN))
  @ApiOperation({ summary: 'Get current question answer' })
  @ApiResponse({ status: 200, description: 'Current question answer retrieved successfully' })
  async getCurrentQuestionAnswer(@Request() req: AuthRequest) {
    return this.cdvqService.getCurrentQuestionAnswer(req.user);
  }

  @Post('game/answer')
  @UseGuards(AuthGuard(UserRole.PLAYER))
  @ApiOperation({ summary: 'Answer a question' })
  @ApiResponse({ status: 201, description: 'Answer submitted successfully' })
  async answerCurrentQuestion(@Body('answer') answer: string, @Request() req: AuthRequest) {
    await this.cdvqService.answerCurrentQuestion(req.user, answer);
  }

  @Get('game/result')
  @UseGuards(AuthGuard(UserRole.PLAYER, UserRole.ADMIN))
  @ApiOperation({ summary: 'Get current round result' })
  @ApiResponse({ status: 200, description: 'Game round result retrieved successfully' })
  getRoundResults() {
    return this.cdvqService.getRoundResults();
  }
}
