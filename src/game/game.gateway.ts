import { ConnectedSocket, OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameRepository } from './game.repository';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private readonly gameRepository: GameRepository) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    const runningGame = await this.gameRepository.getRunningGame();
    if (!runningGame) return;

    await client.join(runningGame.game);
    client.emit('joinedRoom', runningGame.game);
  }
}
