import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Room } from '../common/enum/room.enum';
import { RokStage } from '../common/enum/rok/rokStage.enum';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/user.repository';

@WebSocketGateway({ cors: true })
export class RokGateway {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

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

  endGame() {
    this.server.to(Room.ROK).emit('endGame');
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

  updateMatrix() {
    this.server.to(Room.ROK).emit('updateMatrix');
  }

  updateAttacks() {
    this.server.to(Room.ROK).emit('updateAttacks');
  }

  sendQuestion(teamUsername: string) {
    this.server.to(teamUsername).emit('sendQuestion');
  }
}
