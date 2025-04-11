import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Room } from '../common/enum/room.enum';
import { TgoStage } from '../common/enum/tgo/tgo-stage.enum';

@WebSocketGateway({ cors: true })
export class TgoGateway {
  @WebSocketServer() private readonly server: Server;

  joinRoom() {
    this.server.socketsJoin(Room.CDVQ);
    this.sendMessage('room joined');
  }

  leaveRoom() {
    this.server.socketsLeave(Room.CDVQ);
  }

  sendMessage(message: string) {
    this.server.to(Room.CDVQ).emit('message', message);
  }

  emitTimerUpdate(remainingTime: number) {
    this.server.emit('timerUpdate', remainingTime);
  }

  emitGameEnded() {
    this.server.emit('gameEnded');
  }

  emitGamePaused() {
    this.server.emit('gamePaused');
  }

  emitGameResumed() {
    this.server.emit('gameResumed');
  }

  emitUpdateStage(stage: TgoStage) {
    this.server.emit('updateStage', stage);
  }

  emitReadyTimer(remainingTime: number) {
    this.server.emit('readyTimer', remainingTime);
  }
}
