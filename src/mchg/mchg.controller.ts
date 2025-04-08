import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  SerializeOptions,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MchgImageValidationPipe } from './mchg.pipe';
import {
  CreateRoundReqDto,
  CreateRoundResDto,
  GetAllRoundsResDto,
  GetCurrentRoundResDto,
  SubmitAnswerReqDto,
} from '../dtos/mchg.dto';
import { MchgService } from './mchg.service';
import { diskStorage } from 'multer';
import { globalConfigs } from '../common/constants/global-config.constant';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
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
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ type: CreateRoundResDto })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: globalConfigs.assetsRoot,
        filename: (req, file, cb) => {
          const filename = `${Date.now()}.${file.mimetype.split('/')[1]}`;
          cb(null, filename);
        },
      }),
    }),
  )
  createRound(
    @UploadedFile(new MchgImageValidationPipe()) image: Express.Multer.File,
    @Body() body: CreateRoundReqDto,
  ): Promise<CreateRoundResDto> {
    return this.mchgService.createRound({ ...body, image });
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
  })
  async getCurrentRound(): Promise<GetCurrentRoundResDto> {
    return await this.mchgService.getCurrentRound();
  }

  @Post('rounds/current/questions/select/:id')
  @ApiOperation({ summary: "Select the current round's question" })
  @ApiOkResponse({ description: "Select the current round's question" })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  async selectQuestion(@Param('id') id: string) {
    return await this.mchgService.selectQuestion(id);
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

  @Post('mainQuestion/request')
  @ApiOperation({ summary: 'Request to answer the main question' })
  @ApiCreatedResponse({ description: 'Request submitted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  async requestToAnswerMainQuestion(@Req() { user }: AuthRequest) {
    await this.mchgService.requestToAnswerMainQuestion(user.username);
  }

  @Post('mainQuestion/dequeue')
  @ApiOperation({ summary: 'Dequeue the main question requests queue' })
  @ApiCreatedResponse({ description: 'Dequeued the main question requests queue' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  async mainQuestionDequeue() {
    await this.mchgService.mainQuestionDequeue();
  }

  @Post('mainQuestion/reward/:teamUsername')
  @ApiOperation({ summary: 'Reward the team with correct main answer' })
  @ApiCreatedResponse({ description: 'Rewarded the team with correct main answer' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  async rewardMainQuestion(@Param() teamUsername: string) {
    await this.mchgService.rewardMainQuestion(teamUsername);
  }
}
