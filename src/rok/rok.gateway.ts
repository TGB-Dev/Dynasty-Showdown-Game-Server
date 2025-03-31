import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RokService } from './rok.service';
import { Room } from '../common/enum/room.enum';

@WebSocketGateway()
export class RokGateway {
  @WebSocketServer() private readonly server: Server;

  constructor(private readonly rokService: RokService) {}

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
}
