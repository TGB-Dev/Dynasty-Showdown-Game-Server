import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  root(): string {
    return `Dynasty Showdown Game Server is running. Now is ${new Date().getTime()}`;
  }
}
