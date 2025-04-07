import { ConnectedSocket, OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Room } from '../common/enum/room.enum';
import { UnauthorizedException } from '@nestjs/common';
import { RokStage } from '../common/enum/rok/rokStage.enum';
import { SendRokQuestionDto } from '../dtos/rok.dto';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/user.repository';
import { RokAttack } from '../schemas/rok/rokAttack.schema';
import { RokMatrixState } from '../schemas/rok/rokMatrixState.schema';

@WebSocketGateway()
export class RokGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [type, token] = client.handshake.headers.authorization?.split(' ') ?? [];
    const tokenData: { sub: string } = await this.jwtService.verifyAsync(token);
    const user = await this.userRepository.findUserByUsername(tokenData.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    await client.join(tokenData.sub);
  }

  joinRoom() {
    this.server.socketsJoin(Room.ROK);
    this.sendMessage('room joined');
  }

  leaveRoom() {
    this.server.socketsLeave(Room.ROK);
  }

  sendMessage(message: string) {
    this.server.to(Room.ROK).emit('message', message);
  }

  pauseGame() {
    this.server.to(Room.ROK).emit('pauseGame');
  }

  resumeGame() {
    this.server.to(Room.ROK).emit('resumeGame');
  }

  updateTimer(remainingTimeInSeconds: number) {
    this.server.to(Room.ROK).emit('timerUpdate', remainingTimeInSeconds);
  }

  updateRunGameTimer(remainingTimeInSeconds: number) {
    this.server.to(Room.ROK).emit('runGameTimerUpdate', remainingTimeInSeconds);
  }

  updateStage(stage: RokStage) {
    this.server.to(Room.ROK).emit('updateStage', stage);
  }

  updateRound(round: number) {
    this.server.to(Room.ROK).emit('updateRound', round);
  }

  updateMatrix(matrix: RokMatrixState[]) {
    this.server.to(Room.ROK).emit('updateMatrix', matrix);
  }

  updateAttacks(attacks: RokAttack[]) {
    this.server.to(Room.ROK).emit('updateAttacks', attacks);
  }

  sendQuestion(teamUsername: string, question: SendRokQuestionDto) {
    this.server.to(teamUsername).emit('sendQuestion', question);
  }
}
