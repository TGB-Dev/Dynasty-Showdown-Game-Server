import { BadRequestException, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { CdvqGateway } from '../cdvq/cdvq.gateway';
import { Room } from '../common/enum/room.enum';
import { RokGateway } from '../rok/rok.gateway';
import { TgoGateway } from '../tgo/tgo.gateway';
import { MchgGateway } from '../mchg/mchg.gateway';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly cdvqGateway: CdvqGateway,
    private readonly mchgGateway: MchgGateway,
    private readonly tgoGateway: TgoGateway,
    private readonly rokGateway: RokGateway,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Post('start-game/:roomName')
  startGame(@Param('roomName') roomName: string) {
    if (roomName === Room.CDVQ.toString()) {
      console.log('Starting game in CDVQ room');
      this.cdvqGateway.joinRoom();
    } else if (roomName === Room.MCHG.toString()) {
      console.log('Starting game in MCHG room');
    } else if (roomName === Room.TGO.toString()) {
      console.log('Starting game in TGO room');
    } else if (roomName === Room.ROK.toString()) {
      console.log('Starting game in ROK room');
      this.rokGateway.joinRoom();
    } else {
      throw new BadRequestException(`Invalid room name: ${roomName}`, 'invalid_room_name');
    }
  }
}
