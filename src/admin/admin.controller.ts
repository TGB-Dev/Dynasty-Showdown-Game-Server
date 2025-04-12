import { BadRequestException, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { UserRole } from '../common/enum/roles.enum';
import { CdvqGateway } from '../cdvq/cdvq.gateway';
import { Room } from '../common/enum/room.enum';
import { RokGateway } from '../rok/rok.gateway';
import { TgoGateway } from '../tgo/tgo.gateway';
import { MchgGateway } from '../mchg/mchg.gateway';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GameRepository } from '../game/game.repository';

@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly cdvqGateway: CdvqGateway,
    private readonly mchgGateway: MchgGateway,
    private readonly tgoGateway: TgoGateway,
    private readonly rokGateway: RokGateway,
    private readonly gameRepository: GameRepository,
  ) {}

  @UseGuards(AuthGuard(UserRole.ADMIN))
  @Post('startGame/:roomName')
  async startGame(@Param('roomName') roomName: string) {
    const runningGame = await this.gameRepository.getRunningGame();

    if (runningGame !== null) {
      throw new BadRequestException('A game is already running', 'game_already_running');
    }

    if (roomName === Room.CDVQ.toString()) {
      console.log('Starting game in CDVQ room');
      this.cdvqGateway.joinRoom();
      await this.gameRepository.setRunningGame(Room.CDVQ);
    } else if (roomName === Room.MCHG.toString()) {
      console.log('Starting game in MCHG room');
      this.mchgGateway.joinRoom();
      await this.gameRepository.setRunningGame(Room.MCHG);
    } else if (roomName === Room.TGO.toString()) {
      console.log('Starting game in TGO room');
      this.tgoGateway.joinRoom();
      await this.gameRepository.setRunningGame(Room.TGO);
    } else if (roomName === Room.ROK.toString()) {
      console.log('Starting game in ROK room');
      this.rokGateway.joinRoom();
      await this.gameRepository.setRunningGame(Room.ROK);
    } else {
      throw new BadRequestException(`Invalid room name: ${roomName}`, 'invalid_room_name');
    }
  }
}
