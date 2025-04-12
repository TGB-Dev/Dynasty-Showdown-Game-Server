import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Room } from '../common/enum/room.enum';

@WebSocketGateway({ cors: true })
export class CdvqGateway {
  @WebSocketServer() private readonly server: Server;

  joinRoom() {
    this.server.socketsJoin(Room.CDVQ);
    this.server.emit('joinedRoom', Room.CDVQ);
  }

  leaveRoom() {
    this.server.socketsLeave(Room.CDVQ);
  }

  sendMessage(message: string) {
    this.server.to(Room.CDVQ).emit('message', message);
  }

  emitTimerUpdate(remainingTime: number) {
    this.server.to(Room.CDVQ).emit('timerUpdate', remainingTime);
  }

  emitGameEnded() {
    this.server.to(Room.CDVQ).emit('gameEnded');
  }

  emitGamePaused() {
    this.server.to(Room.CDVQ).emit('gamePaused');
  }

  emitGameResumed() {
    this.server.to(Room.CDVQ).emit('gameResumed');
  }

  emitQuestion() {
    this.server.to(Room.CDVQ).emit('question');
  }

  emitAnswer() {
    this.server.to(Room.CDVQ).emit('answer');
  }

  emitResult() {
    this.server.to(Room.CDVQ).emit('result');
  }

  emitReadyTimer(remainingTime: number) {
    this.server.to(Room.CDVQ).emit('readyTimer', remainingTime);
  }
}
