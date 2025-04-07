import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { CdvqAnswerDto, ManyQuestionDto, QuestionDto } from '../dtos/cdvq.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvqQuestion.schema';
import { CdvqCRUDService, CdvqGameService } from './cdvq.service';
import { CdvqScoreRecord } from '../schemas/cdvq/cdvqScoreRecord.schema';

@Controller('cdvq/question')
export class CdvqQuestionController {
  constructor(private readonly questionService: CdvqCRUDService) {}

  @Post('/create')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiBody({ type: QuestionDto })
  async createQuestion(@Body() questionDto: QuestionDto): Promise<{ message: string }> {
    try {
      return await this.questionService.createQuestion(questionDto);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Post('/createmany')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Create multiple questions' })
  @ApiResponse({ status: 201, description: 'Questions created successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiBody({ type: ManyQuestionDto })
  async createManyQuestions(@Body() questionsDto: ManyQuestionDto): Promise<{ message: string }> {
    try {
      return await this.questionService.createManyQuestion(questionsDto);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Delete('/delete/:id')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Delete a question by ID' })
  @ApiParam({ name: 'id', required: true, description: 'MongoDB _id of the question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteQuestion(@Param('id') id: string): Promise<{ message: string }> {
    try {
      return await this.questionService.deleteQuestion(id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Put('/update/:id')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Update a question by ID' })
  @ApiParam({ name: 'id', required: true, description: 'MongoDB _id of the question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiBody({ type: QuestionDto })
  async updateQuestion(@Param('id') id: string, @Body() questionDto: QuestionDto): Promise<{ message: string }> {
    try {
      return await this.questionService.updateQuestion(id, questionDto);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Get('/all')
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @ApiOperation({ summary: 'Get all questions' })
  @ApiResponse({ status: 200, description: 'Returns list of questions', type: [CdvqQuestion] })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllQuestions(): Promise<CdvqQuestion[]> {
    try {
      return await this.questionService.getQuestions();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
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
    try {
      return this.gameService.startGame();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Post('pause')
  @ApiOperation({ summary: 'Pause a game' })
  @ApiResponse({ status: 200, description: 'Game paused successfully' })
  @ApiResponse({ status: 400, description: 'Game paused failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  pauseGame() {
    try {
      return this.gameService.pauseGame();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Post('resume')
  @ApiOperation({ summary: 'Resume a game' })
  @ApiResponse({ status: 200, description: 'Game resumed successfully' })
  @ApiResponse({ status: 400, description: 'Game resumed failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  resumeGame() {
    try {
      return this.gameService.resumeGame();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Post('end')
  @ApiOperation({ summary: 'End game' })
  @ApiResponse({ status: 200, description: 'Game ended successfully' })
  @ApiResponse({ status: 400, description: 'Game ended failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  endGame() {
    try {
      return this.gameService.endGame();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Post('send-result')
  @ApiOperation({ summary: 'Get game result' })
  @ApiResponse({ status: 200, description: 'Game result retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Game result retrieval failed' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  async sendGameResult(): Promise<CdvqScoreRecord[]> {
    try {
      return await this.gameService.sendResult();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
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
  async submit_answer(@Body() answerData: CdvqAnswerDto): Promise<{ message: string }> {
    try {
      return await this.gameService.submitAnswer(answerData);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
