import { Injectable } from '@nestjs/common';

export type BroadcastFn = (timeLeft: number) => void;

@Injectable()
export class CdvqTimerService {
  private isRunning = false;
  private remainingTime = 0;
  private interval: NodeJS.Timeout | null;

  tick() {
    return new Promise<void>((resolve) => {
      this.interval = setInterval(() => {
        if (this.remainingTime <= 0) {
          this.stop();
          resolve();
          return;
        }

        --this.remainingTime;
        this.broadcastFn(this.remainingTime);
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

  start(duration: number, broadcastFn: BroadcastFn) {
    if (this.isRunning) {
      return;
    }

    this.remainingTime = duration;
    this.isRunning = true;
    this.broadcastFn = broadcastFn;
    return this.tick();
  }

  pause() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.isRunning = false;
  }

  resume() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    return this.tick();
  }

  private broadcastFn: BroadcastFn = () => {};
}
