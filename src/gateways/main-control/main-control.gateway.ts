import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class MainControlGateway implements OnGatewayConnection {
  @SubscribeMessage('main-test')
  handleTest(@ConnectedSocket() socket: Socket, @MessageBody() data: string) {
    socket.emit('res', `${data}, ${socket.id}`);
  }

  handleConnection(@ConnectedSocket() socket: Socket) {}

  @SubscribeMessage('rooms')
  handleRooms(@ConnectedSocket() socket: Socket) {
    const joinedRooms: string[] = [];
    socket.rooms.forEach((room: string) => {
      joinedRooms.push(room);
    });
    socket.emit('rooms', joinedRooms);
  }

  @SubscribeMessage('start-game')
  handleStartGame(@ConnectedSocket() socket: Socket, @MessageBody() gameName: string) {
    socket.to(gameName).emit('start-game');
  }

  @SubscribeMessage('pause-game')
  handlePauseGame(@ConnectedSocket() socket: Socket, @MessageBody() gameName: string) {
    socket.to(gameName).emit('pause-game');
  }

  @SubscribeMessage('stop-game')
  handleStopGame(@ConnectedSocket() socket: Socket, @MessageBody() gameName: string) {
    socket.to(gameName).emit('stop-game');
  }

  @SubscribeMessage('start-timer')
  handleStartTimer(@ConnectedSocket() socket: Socket, @MessageBody() gameName: string) {
    socket.to(gameName).emit('start-timer');
  }

  @SubscribeMessage('stop-timer')
  handleStopTimer(@ConnectedSocket() socket: Socket, @MessageBody() gameName: string) {
    socket.to(gameName).emit('stop-timer');
  }
}
