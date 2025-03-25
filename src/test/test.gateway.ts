import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class TestGateway {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return `Hello world to ${client} with payload ${payload}`;
  }
}
