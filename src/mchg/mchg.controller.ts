import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MchgImageValidationPipe } from './mchg.pipe';
import { CreateRoundReqDto, CreateRoundResDto } from '../dtos/mchg.dto';
import { MchgService } from './mchg.service';
import { diskStorage } from 'multer';
import { globalConfigs } from '../common/constants/global-config.constant';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';

@ApiTags('Mật chiếu hoàng gia')
@ApiBearerAuth()
@Controller('mchg')
export class MchgController {
  constructor(private readonly mchgService: MchgService) {}

  @Post('rounds')
  @ApiOperation({ summary: 'Create a compete round' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: CreateRoundResDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
}
