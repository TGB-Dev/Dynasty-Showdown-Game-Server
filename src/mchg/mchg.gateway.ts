import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Room } from '../common/enum/room.enum';
import { MchgStage } from '../common/enum/mchg/mchgStage.enum';
import { MchgQuestion } from '../schemas/mchg/mchgQuestion.schema';

@WebSocketGateway()
export class MchgGateway {
  @WebSocketServer() server: Server;

  joinRoom() {
    this.server.socketsJoin(Room.MCHG);
    this.sendMessage('joined room');
  }

  leaveRoom() {
    this.server.socketsLeave(Room.MCHG);
  }

  endGame() {
    this.server.to(Room.MCHG).emit('endGame');
  }

  sendMessage(message: string) {
    this.server.to(Room.MCHG).emit('message', message);
  }

  answerMainAnswer() {
    this.server.to(Room.MCHG).emit('answerMainAnswer');
  }

  updateStage(stage: MchgStage) {
    this.server.to(Room.MCHG).emit('updateStage', stage);
  }

  updateRunGameTimer(remainingTimeInSeconds: number) {
    this.server.to(Room.MCHG).emit('updateRunGameTimer', remainingTimeInSeconds);
  }

  updateTimer(remainingTimeInSeconds: number) {
    this.server.to(Room.MCHG).emit('updateTimer', remainingTimeInSeconds);
  }

  updateRound(round: number) {
    this.server.to(Room.MCHG).emit('updateRound', round);
  }

  updateSolvedQuestions(questions: MchgQuestion[]) {
    this.server.to(Room.MCHG).emit('updateSolvedQuestions', questions);
  }

  pauseGame() {
    this.server.to(Room.MCHG).emit('pauseGame');
  }

  resumeGame() {
    this.server.to(Room.MCHG).emit('resumeGame');
  }

  broadcastQuestion(question: MchgQuestion) {
    this.server.to(Room.MCHG).emit('broadcastQuestion', question);
  }

  broadcastAnswers() {
    this.server.to(Room.MCHG).emit('broadcastAnswers');
  }
}
