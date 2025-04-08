import { BadRequestException, Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { MchgRoundRepository } from './mchg-round.repository';
import { CreateRoundReqDto } from '../dtos/mchg.dto';
import { User } from '../schemas/user.schema';
import { MchgSubmissionRepository } from './mchg-submission.repository';
import { MchgQuestionRepository } from './mchg-question.repository';
import { MchgStage } from '../common/enum/mchg/mchgStage.enum';
import { MchgGateway } from './mchg.gateway';
import { MchgMainQuestionQueueRepository } from './mchg-main-question-queue.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class MchgService implements OnModuleDestroy {
  private roundIndex: number | null = null;
  private roundCount: number = 3;

  private remainingTime = 0;
  private interval: NodeJS.Timeout | null = null;
  private timerIsRunning: boolean = false;

  private lastStage: MchgStage = MchgStage.PAUSED;
  private currentStage: MchgStage = MchgStage.CHOOSING_QUESTION;

  private selectedQuestionNum = 0;
  private totalQuestionNum = 6;

  constructor(
    private readonly mchgRoundRepository: MchgRoundRepository,
    private readonly mchgSubmissionRepository: MchgSubmissionRepository,
    private readonly mchgQuestionRepository: MchgQuestionRepository,
    private readonly mchgMainQuestionQueueRepository: MchgMainQuestionQueueRepository,
    private readonly userRepository: UserRepository,
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

  resumeGame() {
    this.currentStage = this.lastStage;
    this.lastStage = MchgStage.PAUSED;
    this.mchgGateway.resumeGame();
    void this.runRound();
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

  async getCurrentRound() {
    if (this.roundIndex === null) {
      throw new BadRequestException('Game is not running');
    }

    const round = await this.mchgRoundRepository.getByOrder(this.roundIndex);
    const roundPopulated = await round.populate(['questions', 'currentQuestion'] as const);
    return roundPopulated.toObject();
  }

  async getCurrentQuestion() {
    const currentRound = await this.getCurrentRound();

    return this.mchgQuestionRepository.findById(currentRound.currentQuestion);
  }

  async runGame() {
    await this.startTimer(3, (rem) => this.mchgGateway.updateRunGameTimer(rem));
    void this.runRound();
  }

  async runRound() {
    if (this.roundIndex && this.roundIndex >= this.roundCount) {
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
      if (this.selectedQuestionNum === this.totalQuestionNum) {
        this.answerMainAnswer();
      }

      this.mchgGateway.updateStage(this.currentStage);
      await this.startTimer(30, (rem) => this.mchgGateway.updateTimer(rem));

      this.lastStage = this.currentStage;
      this.currentStage = MchgStage.UPDATE_RESULTS;
      await this.runRound();
    }

    if (this.currentStage === MchgStage.UPDATE_RESULTS) {
      await this.updateScores();
      this.mchgGateway.updateStage(this.currentStage);
      this.mchgGateway.updateSolvedQuestions(await this.mchgQuestionRepository.getSolved());

      this.lastStage = this.currentStage;
      this.currentStage = MchgStage.CHOOSING_QUESTION;
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

  async getCurrentRoundQuestions() {
    return await this.mchgQuestionRepository.getAll();
  }

  async selectQuestion(id: string) {
    const question = await this.mchgQuestionRepository.findById(id);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const currentRound = await this.getCurrentRound();
    currentRound.currentQuestion = id;

    this.selectedQuestionNum++;
    this.mchgGateway.broadcastQuestion(question);

    this.lastStage = this.currentStage;
    this.currentStage = MchgStage.ANSWERING_SUB_QUESTION;
    void this.runRound();
  }

  async requestToAnswerMainQuestion(teamUsername: string) {
    await this.mchgMainQuestionQueueRepository.enqueue(teamUsername);
  }

  async mainQuestionDequeue() {
    await this.mchgMainQuestionQueueRepository.dequeue();

    if ((await this.mchgMainQuestionQueueRepository.length()) === 0) {
      void this.runRound();
    }
  }

  async mainQuestionQueueDeleteAll() {
    await this.mchgMainQuestionQueueRepository.deleteAll();
  }

  async rewardMainQuestion(teamUsername: string) {
    const user = await this.userRepository.findUserByUsername(teamUsername);
    if (!user || !user._id) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.increaseScore(user._id, 150);
    // No other teams can answer the question
    await this.mainQuestionQueueDeleteAll();
    void this.runRound();
  }

  async updateScores() {
    const submissions = await this.mchgSubmissionRepository.getAll();
    for (const submission of submissions) {
      if (submission.answer === submission.question.answer) {
        this.userRepository.increaseScore(submission.user._id!, 15);
      }
    }
    await this.mchgSubmissionRepository.deleteAll();
  }

  onModuleDestroy() {
    this.stopTimer();
  }
}
