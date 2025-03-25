import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class TestGateway {
  @SubscribeMessage('test')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    client.join('testRoom');

    const rooms: string[] = [];
    for (const room of client.rooms) {
      rooms.push(room);
    }
    client.emit('res', `data: ${data}, client: ${client.id}, rooms: [${rooms.join(', ')}]`);
  }
}
