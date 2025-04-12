import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Game } from '../schemas/game.schema';
import { Model } from 'mongoose';
import { Room } from '../common/enum/room.enum';

@Injectable()
export class GameRepository {
  constructor(@InjectModel(Game.name) private readonly gameModel: Model<Game>) {}

  async getRunningGame(): Promise<Game | null> {
    return this.gameModel.findOne({ running: true }).exec();
  }

  async setRunningGame(gameName: Room): Promise<void> {
    await this.gameModel.findOneAndUpdate({ game: gameName }, { running: true }).exec();
  }

  async unsetRunningGame(gameName: Room): Promise<void> {
    await this.gameModel.findOneAndUpdate({ game: gameName }, { running: false }).exec();
  }

  async setStartedGame(gameName: Room): Promise<void> {
    await this.gameModel.findOneAndUpdate({ game: gameName }, { started: true }).exec();
  }

  async unsetStartedGame(gameName: Room): Promise<void> {
    await this.gameModel.findOneAndUpdate({ game: gameName }, { started: false }).exec();
  }

  async getAllGames(): Promise<Game[]> {
    return this.gameModel.find({}).exec();
  }

  async getGameByName(gameName: Room): Promise<Game | null> {
    return this.gameModel.findOne({ name: gameName }).exec();
  }
}
