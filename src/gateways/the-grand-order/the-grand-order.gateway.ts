import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from '../../schemas/question.schema';
import { Model } from 'mongoose';

@WebSocketGateway()
export class TheGrandOrderGateway {
  private readonly gameId = 2;

  constructor(@InjectModel(Question.name) private questionModel: Model<Question>) {}

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
