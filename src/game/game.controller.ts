import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('running')
  getRunningGame() {
    return this.gameService.getRunningGame();
  }

  @Get('all')
  getAllGames() {
    return this.gameService.getAllGames();
  }
}
