import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Room } from '../common/enum/room.enum';

@WebSocketGateway()
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
}
