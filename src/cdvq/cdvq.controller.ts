import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { QuestionDto } from '../dtos/cdvq.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvq-question-schema';
import { CdvqService } from './cdvq.service';

@Controller('cdvq')
export class CdvqController {
  constructor(private readonly cdvqService: CdvqService) {}

  @Get('questions/:id')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Get a question by ID' })
  @ApiParam({ name: 'id', required: true, description: 'MongoDB _id of the question' })
  @ApiResponse({ status: 200, description: 'Returns the question', type: CdvqQuestion })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getQuestionById(@Param('id') id: string): Promise<CdvqQuestion | null> {
    return this.cdvqService.getQuestionById(id);
  }

  @Get('questions/current')
  @UseGuards(AuthGuard(UserRole.PLAYER, UserRole.ADMIN))
  @ApiOperation({ summary: 'Get current question' })
  @ApiResponse({ status: 200, description: 'Current question retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Current question retrieval failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
  @ApiResponse({ status: 200, description: 'Game started successfully' })
  @ApiResponse({ status: 400, description: 'Game started failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  startGame() {
    return this.cdvqService.startGame();
  }
}
//
// @Controller('cdvq/game')
// export class CdvqGameController {
//   constructor(private readonly gameService: CdvqGameService) {}
//
//   @Post('start')
//   @ApiOperation({ summary: 'Start game' })
//   @ApiParam({ name: 'time', required: true, description: 'Total time of game' })
//   @ApiResponse({ status: 200, description: 'Game started successfully' })
//   @ApiResponse({ status: 400, description: 'Game started failed' })
//   @ApiResponse({ status: 500, description: 'Internal Server Error' })
//   @UseGuards(AuthGuard(UserRole.ADMIN))
//   startGame() {
//     return this.gameService.startGame();
//   }
//
//   @Post('pause')
//   @ApiOperation({ summary: 'Pause a game' })
//   @ApiResponse({ status: 200, description: 'Game paused successfully' })
//   @ApiResponse({ status: 400, description: 'Game paused failed' })
//   @ApiResponse({ status: 500, description: 'Internal Server Error' })
//   @UseGuards(AuthGuard(UserRole.ADMIN))
//   pauseGame() {
//     return this.gameService.pauseGame();
//   }
//
//   @Post('resume')
//   @ApiOperation({ summary: 'Resume a game' })
//   @ApiResponse({ status: 200, description: 'Game resumed successfully' })
//   @ApiResponse({ status: 400, description: 'Game resumed failed' })
//   @ApiResponse({ status: 500, description: 'Internal Server Error' })
//   @UseGuards(AuthGuard(UserRole.ADMIN))
//   resumeGame() {
//     return this.gameService.resumeGame();
//   }
//
//   @Post('end')
//   @ApiOperation({ summary: 'End game' })
//   @ApiResponse({ status: 200, description: 'Game ended successfully' })
//   @ApiResponse({ status: 400, description: 'Game ended failed' })
//   @ApiResponse({ status: 500, description: 'Internal Server Error' })
//   @UseGuards(AuthGuard(UserRole.ADMIN))
//   endGame() {
//     return this.gameService.endGame();
//   }
//
//   @Post('send-result')
//   @ApiOperation({ summary: 'Get game result' })
//   @ApiResponse({ status: 200, description: 'Game result retrieved successfully' })
//   @ApiResponse({ status: 400, description: 'Game result retrieval failed' })
//   @ApiResponse({ status: 500, description: 'Internal Server Error' })
//   @UseGuards(AuthGuard(UserRole.ADMIN))
//   async sendGameResult(): Promise<CdvqScore[]> {
//     return await this.gameService.sendResult();
//   }
//
//   @Get('get-current-question')
//   @ApiOperation({ summary: 'Get current question' })
//   @ApiResponse({ status: 200, description: 'Current question retrieved successfully' })
//   @ApiResponse({ status: 400, description: 'Current question retrieval failed' })
//   @ApiResponse({ status: 500, description: 'Internal Server Error' })
//   @UseGuards(AuthGuard(UserRole.PLAYER, UserRole.ADMIN))
//   getCurrentQuestion() {
//     return this.gameService.getCurrentQuestion();
//   }
// }
//
// @Controller('cdvq/answer')
// export class CdvqAnswerController {
//   constructor(private readonly gameService: CdvqGameService) {}
//
//   @Post('submit')
//   @ApiOperation({ summary: 'Submit answer' })
//   @ApiResponse({ status: 200, description: 'Answer submitted successfully' })
//   @ApiResponse({ status: 400, description: 'Answer submission failed' })
//   @ApiResponse({ status: 500, description: 'Internal Server Error' })
//   @UseGuards(AuthGuard(UserRole.PLAYER))
//   async submit_answer(@Body() answerData: CdvqAnswerDto) {
//     return await this.gameService.submitAnswer(answerData);
//   }
// }
