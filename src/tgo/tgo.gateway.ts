import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Room } from '../common/enum/room.enum';
import { TgoStage } from '../common/enum/tgo/tgo-stage.enum';

@WebSocketGateway({ cors: true })
export class TgoGateway {
  @WebSocketServer() private readonly server: Server;

  joinRoom() {
    this.server.socketsJoin(Room.TGO);
    this.server.emit('joinedRoom', Room.TGO);
  }

  leaveRoom() {
    this.server.socketsLeave(Room.TGO);
  }

  sendMessage(message: string) {
    this.server.to(Room.TGO).emit('message', message);
  }

  emitTimerUpdate(remainingTime: number) {
    this.server.to(Room.TGO).emit('timerUpdate', remainingTime);
  }

  emitGameEnded() {
    this.server.to(Room.TGO).emit('gameEnded');
  }

  emitGamePaused() {
    this.server.to(Room.TGO).emit('gamePaused');
  }

  emitGameResumed() {
    this.server.to(Room.TGO).emit('gameResumed');
  }

  emitUpdateStage(stage: TgoStage) {
    this.server.to(Room.TGO).emit('updateStage', stage);
  }

  emitReadyTimer(remainingTime: number) {
    this.server.to(Room.TGO).emit('readyTimer', remainingTime);
  }
}
