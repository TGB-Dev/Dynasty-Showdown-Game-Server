import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RokStatus } from '../schemas/rokStatus.schema';
import { Model } from 'mongoose';
import { RokMatrixState } from '../schemas/rokMatrixState';

// NOTE: in this class, the status ID is always 0 because the game play is done sequentially, so there is no need to
// maintain multiple states.

@Injectable()
export class RokRepository {
  constructor(
    @InjectModel(RokStatus.name) private readonly rokStatusModel: Model<RokStatus>,
    @InjectModel(RokMatrixState.name) private readonly rokMatrixModel: Model<RokMatrixState>,
  ) {}

  async getOwner(cityId: number) {
    return (await this.rokMatrixModel.findOne({ cityId: cityId }).exec())!.owner;
  }

  async updateState(attackTeamUsername: string, cityId: number) {
    // Query the current owner of the current city
    // The city is guaranteed to be existed
    const currentOwner = await this.getOwner(cityId);

    return await this.rokStatusModel
      .findOneAndUpdate(
        { cityId: cityId },
        {
          attackTeam: attackTeamUsername,
          defendTeam: currentOwner,
          cityId: cityId,
        },
      )
      .exec();
  }

  // Return true when successfully updated
  async claimCity(teamUsername: string, cityId: number) {
    const updatedCity = await this.rokMatrixModel
      .findOneAndUpdate(
        { cityId: cityId, owner: undefined },
        {
          owner: teamUsername,
        },
        {
          new: true,
        },
      )
      .exec();

    if (!updatedCity) {
      return false;
    }
    return true;
  }

  async unclaimCity(teamUsername: string, cityId: number) {
    const updatedCity = await this.rokMatrixModel
      .findOneAndUpdate(
        {
          cityId: cityId,
          owner: teamUsername,
        },
        { owner: undefined },
        { new: true },
      )
      .exec();

    if (!updatedCity) {
      return false;
    }
    return true;
  }

  async recalculatePoints() {
    const cities = await this.rokMatrixModel.find().exec();
    const points = {};
    cities.forEach((c) => {
      if (c.owner) {
        if (!points[c.owner]) {
          points[c.owner] = 0;
        }
        points[c.owner] += c.points;
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [k, v] of Object.entries(points)) {
      // TODO: Update the points of teamName `k` an amount of `v`
    }
  }
}
