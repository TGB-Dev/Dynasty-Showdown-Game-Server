import { Injectable } from '@nestjs/common';

export type CallbackFn = (timeLeft: number) => void;

@Injectable()
export class MchgTimerService {
  private running = false;
  private paused = false;
  private remainingTime = 0;
  private interval: NodeJS.Timeout | null;
  private callbackFn: CallbackFn;

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.running = false;
    this.paused = false;
  }

  start(duration: number, callbackFn: CallbackFn) {
    if (this.running) {
      return;
    }

    this.remainingTime = duration;
    this.running = true;
    this.paused = false;
    this.callbackFn = callbackFn;

    return this.tick();
  }

  pause() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.paused = true;
    }
  }

  resume() {
    if (!this.paused) {
      return;
    }

    this.running = true;
    this.paused = false;
    return this.tick();
  }

  isPaused(): boolean {
    return this.paused;
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
