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
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { ManyQuestionDto, QuestionDto } from './dto/Question.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvqQuestion.schema';
import { CdvqService } from './cdvq.service';

@Controller('cdvq')
export class CdvqController {
  constructor(private readonly questionService: CdvqService) {}

  @Post('/question/create')
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

  @Post('/question/createmany')
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

  @Delete('/question/delete/:id')
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

  @Put('/question/update/:id')
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

  @Get('/questions')
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
