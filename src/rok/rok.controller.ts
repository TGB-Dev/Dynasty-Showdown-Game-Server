import { Controller, Get } from '@nestjs/common';
import { RokService } from './rok.service';

@Controller('rok')
export class RokController {
  constructor(private readonly rokService: RokService) {}

  @Get('start')
  startGame() {}

  @Get('stop')
  stopGame() {}

  @Get('run')
  runGame() {}

  @Get('startTimer')
  startTimer() {}

  @Get('stopTimer')
  stopTimer() {}

  @Get('claimCity')
  claimCity() {}

  @Get('unclaimCity')
  unclaimCity() {}

  @Get('attackCity')
  attackCity() {}
}
