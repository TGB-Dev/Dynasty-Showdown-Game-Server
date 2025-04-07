import {
  Body,
  Controller,
  Get,
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

@ApiTags('Mật chiếu hoàng gia')
@ApiBearerAuth()
@Controller('mchg')
export class MchgController {
  constructor(private readonly mchgService: MchgService) {}

  @Post('game/run')
  @ApiOperation({ summary: 'Start the game' })
  @ApiOkResponse({ description: 'Game started' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  runGame() {
    return this.mchgService.runGame();
  }

  @Post('game/pause')
  @ApiOperation({ summary: 'Pause the game' })
  @ApiOkResponse({ description: 'Game paused' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  pauseGame() {
    this.mchgService.pauseGame();
  }

  @Post('game/resume')
  @ApiOperation({ summary: 'Resume the game' })
  @ApiOkResponse({ description: 'Game resumed' })
  @UseGuards(AuthGuard(UserRole.ADMIN))
  async resumeGame() {
    await this.mchgService.resumeGame();
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

  @Post('answer')
  @ApiOperation({ summary: 'Submit answer for the current round' })
  @ApiCreatedResponse({ description: 'Answer submitted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard(UserRole.PLAYER))
  async submitAnswer(@Body() { answer }: SubmitAnswerReqDto, @Req() { user }: AuthRequest) {
    await this.mchgService.submitAnswer(answer, user);
  }
}
