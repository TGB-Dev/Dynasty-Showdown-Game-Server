import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { CdvqAnswerDto, ManyQuestionDto, QuestionDto } from '../dtos/cdvq.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvq-question-schema';
import { CdvqCRUDService, CdvqGameService } from './cdvq.service';
import { CdvqScore } from '../schemas/cdvq/cdvq-score.schema';

@Controller('cdvq/question')
export class CdvqQuestionController {
  constructor(private readonly questionService: CdvqCRUDService) {}

  @Post('/create')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiBody({ type: QuestionDto })
  async createQuestion(@Body() questionDto: QuestionDto) {
    return await this.questionService.createQuestion(questionDto);
  }

  @Post('/createmany')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Create multiple questions' })
  @ApiResponse({ status: 201, description: 'Questions created successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiBody({ type: ManyQuestionDto })
  async createManyQuestions(@Body() questionsDto: ManyQuestionDto) {
    return await this.questionService.createManyQuestion(questionsDto);
  }

  @Delete('/delete/:id')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Delete a question by ID' })
  @ApiParam({ name: 'id', required: true, description: 'MongoDB _id of the question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteQuestion(@Param('id') id: string) {
    return await this.questionService.deleteQuestion(id);
  }

  @Put('/update/:id')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Update a question by ID' })
  @ApiParam({ name: 'id', required: true, description: 'MongoDB _id of the question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiBody({ type: QuestionDto })
  async updateQuestion(@Param('id') id: string, @Body() questionDto: QuestionDto) {
    return await this.questionService.updateQuestion(id, questionDto);
  }

  @Get('/all')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Get all questions' })
  @ApiResponse({ status: 200, description: 'Returns list of questions', type: [CdvqQuestion] })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllQuestions(): Promise<CdvqQuestion[]> {
    return await this.questionService.getQuestions();
  }

  @Get('/:id')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Get a question by ID' })
  @ApiParam({ name: 'id', required: true, description: 'MongoDB _id of the question' })
  @ApiResponse({ status: 200, description: 'Returns the question', type: CdvqQuestion })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getQuestionById(@Param('id') id: string): Promise<CdvqQuestion> {
    return await this.questionService.getQuestionById(id);
  }
}

@Controller('cdvq/game')
export class CdvqGameController {
  constructor(private readonly gameService: CdvqGameService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start game' })
  @ApiParam({ name: 'time', required: true, description: 'Total time of game' })
  @ApiResponse({ status: 200, description: 'Game started successfully' })
  @ApiResponse({ status: 400, description: 'Game started failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  startGame() {
    return this.gameService.startGame();
  }

  @Post('pause')
  @ApiOperation({ summary: 'Pause a game' })
  @ApiResponse({ status: 200, description: 'Game paused successfully' })
  @ApiResponse({ status: 400, description: 'Game paused failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  pauseGame() {
    return this.gameService.pauseGame();
  }

  @Post('resume')
  @ApiOperation({ summary: 'Resume a game' })
  @ApiResponse({ status: 200, description: 'Game resumed successfully' })
  @ApiResponse({ status: 400, description: 'Game resumed failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  resumeGame() {
    return this.gameService.resumeGame();
  }

  @Post('end')
  @ApiOperation({ summary: 'End game' })
  @ApiResponse({ status: 200, description: 'Game ended successfully' })
  @ApiResponse({ status: 400, description: 'Game ended failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  endGame() {
    return this.gameService.endGame();
  }

  @Post('send-result')
  @ApiOperation({ summary: 'Get game result' })
  @ApiResponse({ status: 200, description: 'Game result retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Game result retrieval failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  async sendGameResult(): Promise<CdvqScore[]> {
    return await this.gameService.sendResult();
  }

  @Get('get-current-question')
  @ApiOperation({ summary: 'Get current question' })
  @ApiResponse({ status: 200, description: 'Current question retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Current question retrieval failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.PLAYER, UserRole.ADMIN))
  getCurrentQuestion() {
    return this.gameService.getCurrentQuestion();
  }
}

@Controller('cdvq/answer')
export class CdvqAnswerController {
  constructor(private readonly gameService: CdvqGameService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit answer' })
  @ApiResponse({ status: 200, description: 'Answer submitted successfully' })
  @ApiResponse({ status: 400, description: 'Answer submission failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  async submit_answer(@Body() answerData: CdvqAnswerDto) {
    return await this.gameService.submitAnswer(answerData);
  }
}
