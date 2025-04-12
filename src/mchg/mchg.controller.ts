import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  SerializeOptions,
  StreamableFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  CreateRoundReqDto,
  CreateRoundResDto,
  GetAllRoundsResDto,
  GetCurrentRequestUserResDto,
  GetCurrentRoundCurrentQuestionResDto,
  GetCurrentRoundResDto,
  SubmitAnswerReqDto,
} from '../dtos/mchg.dto';
import { MchgService } from './mchg.service';
import { globalConfigs } from '../common/constants/global-config.constant';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { AuthRequest } from '../common/interfaces/request.interface';
import { RoleBasedClassSerializer } from '../common/interceptors/role-based-class-serializer';
import { MchgQuestion } from '../schemas/mchg/mchgQuestion.schema';
import { createReadStream, writeFileSync } from 'fs';
import { join } from 'path';
import mime from 'mime-types';

@ApiTags('Mật chiếu hoàng gia')
@ApiBearerAuth()
@Controller('mchg')
export class MchgController {
  constructor(private readonly mchgService: MchgService) {}

  @Post('game/run')
  @ApiOperation({ summary: 'Start the game' })
  @ApiOkResponse({ description: 'Game started' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  runGame() {
    return this.mchgService.runGame();
  }

  @Post('game/pause')
  @ApiOperation({ summary: 'Pause the game' })
  @ApiOkResponse({ description: 'Game paused' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  pauseGame() {
    this.mchgService.pauseGame();
  }

  @Post('game/resume')
  @ApiOperation({ summary: 'Resume the game' })
  @ApiOkResponse({ description: 'Game resumed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  resumeGame() {
    this.mchgService.resumeGame();
  }

  @Post('rounds')
  @ApiOperation({ summary: 'Create a compete round' })
  @ApiCreatedResponse({ type: CreateRoundResDto })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  createRound(@Body() body: CreateRoundReqDto): Promise<CreateRoundResDto> {
    const imageName = `${Date.now()}.png`;
    const buffer = Buffer.from(body.image, 'base64');
    writeFileSync(join(globalConfigs.assetsRoot, imageName), buffer);

    return this.mchgService.createRound({
      image: imageName,
      answer: body.answer,
      questions: body.questions,
      order: body.order,
    });
  }

  @Get('image')
  @ApiOperation({ summary: 'Get the image' })
  @ApiOkResponse({ description: 'Returns the image' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getImage(@Query('filename') filename: string) {
    const file = createReadStream(join(globalConfigs.assetsRoot, filename));
    // @ts-expect-error Some weird TS definitions
    return new StreamableFile(file, {
      type: mime.lookup(filename),
    });
  }

  @Get('rounds')
  @ApiOperation({ summary: 'Get all compete rounds' })
  @ApiOkResponse({ type: [GetAllRoundsResDto] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  getAllRounds(): Promise<GetAllRoundsResDto[]> {
    return this.mchgService.getAllRounds();
  }

  @Get('rounds/current')
  @ApiOperation({ summary: 'Get the current compete round' })
  @ApiCreatedResponse({ type: GetAllRoundsResDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN, UserRole.PLAYER))
  @UseInterceptors(RoleBasedClassSerializer)
  @SerializeOptions({
    type: GetCurrentRoundResDto,
    excludeExtraneousValues: true,
  })
  async getCurrentRound(): Promise<GetCurrentRoundResDto> {
    return await this.mchgService.getCurrentRound();
  }

  @Post('rounds/current/questions/select/:index')
  @ApiOperation({ summary: "Select the current round's question" })
  @ApiOkResponse({ description: "Select the current round's question" })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  async selectQuestion(@Param('index') index: number) {
    return await this.mchgService.selectQuestion(index);
  }

  @Get('rounds/current/questions')
  @ApiOperation({ summary: "Get the current round's questions" })
  @ApiOkResponse({ type: [MchgQuestion] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  async getCurrentRoundQuestions() {
    return await this.mchgService.getCurrentRoundQuestions();
  }

  @Post('answer')
  @ApiOperation({ summary: 'Submit answer for the current round' })
  @ApiCreatedResponse({ description: 'Answer submitted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  async submitAnswer(@Body() { answer }: SubmitAnswerReqDto, @Req() { user }: AuthRequest) {
    await this.mchgService.submitAnswer(answer, user);
  }

  @Get('round/current/currentQuestion')
  @ApiOperation({ summary: "Get the current round's current question" })
  @ApiOkResponse({ type: [GetCurrentRoundCurrentQuestionResDto] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  @UseInterceptors()
  @SerializeOptions({
    type: GetCurrentRoundCurrentQuestionResDto,
    excludeExtraneousValues: true,
  })
  async getCurrentRoundCurrentQuestion() {
    return await this.mchgService.getCurrentRoundCurrentQuestion();
  }

  @Get('round/current/currentAnswer')
  @ApiOperation({ summary: "Get the current question's answer (should be called in 5s after receiving the signal)" })
  @ApiOkResponse({ type: String })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard())
  async getCurrentQuestionAnswer(@Req() { user }: AuthRequest) {
    return await this.mchgService.getCurrentQuestionAnswer(user._id!);
  }

  @Post('mainQuestion/request')
  @ApiOperation({ summary: 'Request to answer the main question' })
  @ApiCreatedResponse({ description: 'Request submitted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  async requestToAnswerMainQuestion(@Req() { user }: AuthRequest) {
    await this.mchgService.requestAnswerMainQuestion(user);
  }

  @Post('mainQuestion/next')
  @ApiOperation({ summary: 'Dequeue the main question requests queue' })
  @ApiCreatedResponse({ description: 'Dequeued the main question requests queue' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  async mainQuestionDequeue() {
    await this.mchgService.nextWaitingUserMainQuestion();
  }

  @Post('mainQuestion/accept')
  @ApiOperation({ summary: 'Reward the current team with correct main answer' })
  @ApiCreatedResponse({ description: 'Rewarded the team with correct main answer' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  async rewardMainQuestion() {
    await this.mchgService.rewardMainQuestion();
  }

  @Get('mainQuestion/currentRequestUser')
  @ApiOperation({ summary: 'Get the current user in the main question queue' })
  @ApiOkResponse({ description: 'Current user in the main question queue' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getMainQuestionCurrentRequestUser(): Promise<GetCurrentRequestUserResDto> {
    return this.mchgService.getCurrentRequestUser();
  }
}
