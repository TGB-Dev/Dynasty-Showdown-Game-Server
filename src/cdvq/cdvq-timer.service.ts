import { Injectable } from '@nestjs/common';

export type BroadcastFn = (timeLeft: number) => void;

@Injectable()
export class CdvqTimerService {
  private isRunning = false;
  private remainingTime = 0;
  private interval: NodeJS.Timeout | null;

  start(duration: number, broadcastFn: BroadcastFn) {
    if (this.isRunning) {
      return;
    }

    this.remainingTime = duration;
    this.isRunning = true;

    return new Promise<void>((resolve) => {
      this.interval = setInterval(() => {
        if (this.remainingTime <= 0) {
          this.stop();
          resolve();
          return;
        }

        --this.remainingTime;
        broadcastFn(this.remainingTime);
      }, 1000);
    });
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.isRunning = false;
  }
}
