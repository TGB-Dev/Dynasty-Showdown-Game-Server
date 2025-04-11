import { Injectable } from '@nestjs/common';

export type CallbackFn = (timeLeft: number) => void;

@Injectable()
export class MchgTimerService {
  private isRunning = false;
  private remainingTime = 0;
  private interval: NodeJS.Timeout | null;
  private callbackFn: CallbackFn;

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.isRunning = false;
  }

  start(duration: number, callbackFn: CallbackFn) {
    if (this.isRunning) {
      return;
    }

    this.remainingTime = duration;
    this.isRunning = true;
    this.callbackFn = callbackFn;

    return this.tick();
  }

  pause() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  resume() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    return this.tick();
  }

  private tick() {
    return new Promise<void>((resolve) => {
      this.interval = setInterval(() => {
        if (this.remainingTime <= 0) {
          this.stop();
          resolve();
          return;
        }

        --this.remainingTime;
        this.callbackFn(this.remainingTime);
      }, 1000);
    });
  }
}
