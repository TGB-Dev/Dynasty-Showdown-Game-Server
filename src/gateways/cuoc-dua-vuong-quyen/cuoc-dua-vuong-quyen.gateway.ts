import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class CuocDuaVuongQuyenGateway {
  @SubscribeMessage('cdvq-test')
  handleTest(@ConnectedSocket() socket: Socket, @MessageBody() data: string) {
    socket.emit('res', `${data}, ${socket.id}`);
  }
}
