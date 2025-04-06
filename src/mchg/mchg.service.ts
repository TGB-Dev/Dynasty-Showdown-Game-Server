import { BadRequestException, forwardRef, Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { MchgRoundRepository } from './mchg-round.repository';
import { CreateRoundReqDto } from '../dtos/mchg.dto';
import { User } from '../schemas/user.schema';
import { MchgSubmissionRepository } from './mchg-submission.repository';
import { MchgQuestionRepository } from './mchg-question.repository';
import { MchgStage } from '../common/enum/mchg/mchgStage.enum';
import { MchgGateway } from './mchg.gateway';

@Injectable()
export class MchgService implements OnModuleDestroy {
  private roundIndex: number | null = null;
  private remainingTime = 0;
  private interval: NodeJS.Timeout | null = null;
  private lastStage: MchgStage = MchgStage.PAUSED;
  private roundCount: number = 3;
  timerIsRunning: boolean = false;
  currentStage: MchgStage = MchgStage.CHOOSING_QUESTION;

  constructor(
    private readonly mchgRoundRepository: MchgRoundRepository,
    private readonly mchgSubmissionRepository: MchgSubmissionRepository,
    private readonly mchgQuestionRepository: MchgQuestionRepository,
    @Inject(forwardRef(() => MchgGateway))
    private readonly mchgGateway: MchgGateway,
  ) {}

  async startTimer(durationInSeconds: number, broadcastFunction: (remainingTimeInSeconds: number) => void) {
    if (this.timerIsRunning) {
      return;
    }

    this.remainingTime = durationInSeconds;
    this.timerIsRunning = true;

    return new Promise<void>((resolve) => {
      this.interval = setInterval(() => {
        if (this.remainingTime <= 0) {
          this.stopTimer();
          resolve();
          return;
        }

        this.remainingTime--;
        broadcastFunction(this.remainingTime);
      }, 1000);
    });
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.timerIsRunning = false;
  }

  answerMainAnswer() {
    this.lastStage = this.currentStage;
    this.currentStage = MchgStage.ANSWERING_MAIN_QUESTION;
    this.stopTimer();
    this.mchgGateway.answerMainAnswer();
  }

  pauseGame() {
    this.lastStage = this.currentStage;
    this.currentStage = MchgStage.PAUSED;
    this.mchgGateway.pauseGame();
  }

  async resumeGame() {
    this.currentStage = this.lastStage;
    this.lastStage = MchgStage.PAUSED;
    this.mchgGateway.resumeGame();
    await this.runRound();
  }

  async createRound(roundDto: Omit<CreateRoundReqDto, 'image'> & { image: Express.Multer.File }) {
    const image = roundDto.image;

    const round = {
      ...roundDto,
      questions: await this.mchgQuestionRepository.createMany(roundDto.questions),
      image: {
        name: image.filename,
      },
    };

    return this.mchgRoundRepository.create(round);
  }

  getAllRounds() {
    return this.mchgRoundRepository.getAll();
  }

  getCurrentRound() {
    if (this.roundIndex === null) {
      throw new BadRequestException('Game is not running');
    }

    return this.mchgRoundRepository.getByOrder(this.roundIndex);
  }

  async getCurrentQuestion() {
    const currentRound = await this.getCurrentRound();

    return this.mchgQuestionRepository.findById(currentRound.currentQuestion);
  }

  async runGame() {
    this.roundIndex = 0;
    await this.startTimer(3, (rem) => this.mchgGateway.updateRunGameTimer(rem));
    await this.runRound();
  }

  async runRound() {
    if (this.roundIndex !== null && this.roundIndex >= this.roundCount) {
      return;
    }

    if (this.currentStage === MchgStage.PAUSED) {
      return;
    }

    if (this.currentStage === MchgStage.CHOOSING_QUESTION) {
      this.mchgGateway.updateStage(this.currentStage);
      // Wait for admin interactions, the stage will be changed to MchgStage.ANSWERING_SUB_QUESTION
      return;
    }

    if (this.currentStage === MchgStage.ANSWERING_SUB_QUESTION) {
      this.mchgGateway.updateStage(this.currentStage);
      await this.startTimer(30, (rem) => this.mchgGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = MchgStage.UPDATE_RESULTS;
      await this.runRound();
    }

    if (this.currentStage === MchgStage.UPDATE_RESULTS) {
      this.mchgGateway.updateStage(this.currentStage);
      this.mchgGateway.updateSolvedQuestions(await this.mchgQuestionRepository.getSolved());

      this.roundIndex!++;
      this.mchgGateway.updateRound(this.roundIndex!);
    }
  }

  async submitAnswer(answer: string, user: User) {
    const currentQuestion = await this.getCurrentQuestion();

    if (currentQuestion === null) throw new BadRequestException('No current question');

    const submission = {
      question: currentQuestion,
      answer,
      user,
    };

    return this.mchgSubmissionRepository.create(submission);
  }

  onModuleDestroy() {
    this.stopTimer();
  }
}
