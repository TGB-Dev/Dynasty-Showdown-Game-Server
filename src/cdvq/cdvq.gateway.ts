import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Room } from '../common/enum/room.enum';
import { CdvqTeamsResultsDto } from '../dtos/cdvq.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvqQuestion.schema';

@WebSocketGateway({ cors: true })
export class CdvqGateway {
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

  emitQuestion(question: Omit<CdvqQuestion, 'answer'>) {
    this.server.emit('question', question);
  }

  emitAnsweredQuestion(answer: string) {
    this.server.emit('answer', answer);
  }

  emitResult(result: CdvqTeamsResultsDto[]) {
    this.server.emit('result', result);
  }

  emitReadyTimer(remainingTime: number) {
    this.server.emit('readyTimer', remainingTime);
  }
}
