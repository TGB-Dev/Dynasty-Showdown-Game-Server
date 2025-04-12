import { Injectable } from '@nestjs/common';
import { GameRepository } from './game.repository';

@Injectable()
export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}

  async getRunningGame() {
    return this.gameRepository.getRunningGame();
  }

  async getAllGames() {
    return this.gameRepository.getAllGames();
  }
}
