import { Module } from '@nestjs/common';
import { GameRepository } from './game.repository';
import { GameGateway } from './game.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from '../schemas/game.schema';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Game.name,
        schema: GameSchema,
      },
    ]),
  ],
  controllers: [GameController],
  providers: [GameRepository, GameGateway, GameService],
  exports: [GameRepository, GameGateway],
  // Add any other necessary modules, controllers, or providers here
})
export class GameModule {}
