import { ConnectedSocket, OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Room } from '../common/enum/room.enum';
import { forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import { RokStage } from '../common/enum/rokStage.enum';
import { RokRepository } from './rok.repository';
import { SendRokQuestionDto } from '../dtos/sendRokQuestion.dto';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/user.repository';

@WebSocketGateway()
export class RokGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => RokRepository))
    private readonly rokRepository: RokRepository,
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

  async updateMatrix() {
    const matrix = await this.rokRepository.getMatrix();
    this.server.to(Room.ROK).emit('updateMatrix', matrix);
  }

  async updateAttacks() {
    const attacks = await this.rokRepository.getAttacks();
    this.server.to(Room.ROK).emit('updateAttacks', attacks);
  }

  sendQuestion(teamUsername: string, question: SendRokQuestionDto) {
    this.server.to(teamUsername).emit('sendQuestion', question);
  }
}
