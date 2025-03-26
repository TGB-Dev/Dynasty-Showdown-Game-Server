import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from '../../schemas/question.schema';
import { Model } from 'mongoose';

@WebSocketGateway()
export class RiseOfKingdomGateway {
  private readonly gameId = 3;

  constructor(@InjectModel(Question.name) private questionModel: Model<Question>) {}

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
