import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class MatChieuHoangGiaGateway {
  @SubscribeMessage('mchg-test')
  handleTest(@ConnectedSocket() socket: Socket, @MessageBody() data: string) {
    socket.emit('res', `${data}, ${socket.id}`);
  }
}
