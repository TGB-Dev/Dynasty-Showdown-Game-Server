import { BadRequestException, Injectable } from '@nestjs/common';
import { CdvqQuestionRepository } from './cdvq-question.repository';
import { CdvqAnswerDto, ManyQuestionDto, QuestionDto } from '../dtos/cdvq.dto';
import { CdvqQuestion } from '../schemas/cdvq/cdvq-question-schema';
import { CdvqGateway } from './cdvq.gateway';
import { UserRepository } from '../user/user.repository';
import { CdvqScore } from '../schemas/cdvq/cdvq-score.schema';
import { CdvqState } from '../common/enum/cdvq-state.enum';
import { CdvqScoreRepository } from './cdvq-score.repository';

@Injectable()
export class CdvqCRUDService {
  constructor(private readonly cdvqRepository: CdvqQuestionRepository) {}

  async createQuestion(questionDTO: QuestionDto) {
    return await this.cdvqRepository.create(questionDTO);
  }

  async createManyQuestion(questionsDto: ManyQuestionDto) {
    return await this.cdvqRepository.createMany(questionsDto);
  }

  async deleteQuestion(questionId: string) {
    return await this.cdvqRepository.delete(questionId);
  }

  async updateQuestion(questionId: string, updateData: QuestionDto) {
    return await this.cdvqRepository.update(questionId, updateData);
  }

  async getQuestions(): Promise<CdvqQuestion[]> {
    return await this.cdvqRepository.getAll();
  }

  async getQuestionById(id: string): Promise<CdvqQuestion> {
    const question = await this.cdvqRepository.getById(id);
    if (!question) {
      throw new BadRequestException('Question not found');
    }
    return question;
  }
}

@Injectable()
export class CdvqGameService {
  private gameState: CdvqState = CdvqState.WAITING;
  private remainingTime: number = 30;
  private readyTime: number = 3;
  private timer: NodeJS.Timeout;
  private currentQuestion: CdvqQuestion | null = null;
  private roundNumber: number = 0;
  private startTime: number | null = null;

  constructor(
    private readonly gameGateway: CdvqGateway,
    private readonly scoreRecordRepository: CdvqScoreRepository,
    private readonly questionRepository: CdvqQuestionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private startCountdown(currentQuestion: CdvqQuestion) {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.gameState === CdvqState.RUNNING) {
        if (!this.startTime) this.startTime = Date.now();
        this.gameGateway.emitTimerUpdate(this.remainingTime);
        if (this.remainingTime <= 0) {
          clearInterval(this.timer);
          this.gameState = CdvqState.ENDED;
          this.gameGateway.emitGameEnded();
          this.questionRepository
            .updateStatus(currentQuestion, 'completed')
            .catch((error) => console.error('Failed to update question status:', error));
          this.gameGateway.emitAnsweredQuestion(currentQuestion.answer);
          this.calculateScore().catch((error) => console.error('Failed to update question status:', error));
        }
        this.remainingTime--;
      }
    }, 1000);
  }

  private readyCountdown(currentQuestion: CdvqQuestion) {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.gameState !== CdvqState.RUNNING) {
        this.gameGateway.emitReadyTimer(this.readyTime);
        if (this.readyTime <= 0) {
          this.gameState = CdvqState.RUNNING;
          clearInterval(this.timer);
          if (!currentQuestion) {
            throw new BadRequestException('No current question found');
          }
          this.gameGateway.emitQuestion(currentQuestion);
          this.startCountdown(currentQuestion);
        }
        this.readyTime--;
      }
    }, 1000);
  }

  async startGame() {
    if (this.gameState !== CdvqState.WAITING && this.gameState !== CdvqState.ENDED) {
      throw new BadRequestException('Game started');
    }

    const roundDuration = 30;

    this.gameState = CdvqState.WAITING;
    this.startTime = null;
    this.readyTime = 3;
    this.remainingTime = roundDuration;
    this.roundNumber++;
    const question = (await this.questionRepository.getFirstWaiting())!.toObject();
    this.currentQuestion = question;
    await this.questionRepository.updateDate(question, new Date());
    this.readyCountdown(question);
    return { message: `Game started`, remainingTime: this.remainingTime, readyTime: this.readyTime };
  }

  pauseGame() {
    if (this.gameState !== CdvqState.RUNNING) {
      throw new BadRequestException('Cannot pause');
    }
    this.gameState = CdvqState.PAUSED;
    clearInterval(this.timer);
    this.gameGateway.emitGamePaused();
    return { message: `Game paused`, remainingTime: this.remainingTime };
  }

  resumeGame() {
    if (this.gameState !== CdvqState.PAUSED) {
      throw new BadRequestException('Cannot resume');
    }

    if (!this.currentQuestion) {
      throw new BadRequestException('No current question found');
    }
    this.readyTime = 3;
    this.gameGateway.emitGameResumed();
    this.readyCountdown(this.currentQuestion);
    return { message: `Game resumed`, remainingTime: this.remainingTime };
  }

  endGame() {
    if (this.gameState !== CdvqState.RUNNING && this.gameState !== CdvqState.PAUSED) {
      throw new BadRequestException('Cannot end');
    }
    this.currentQuestion = null;
    this.gameState = CdvqState.ENDED;
    clearInterval(this.timer);
    this.gameGateway.emitGameEnded();
    return { message: `Game ended`, remainingTime: this.remainingTime };
  }

  async submitAnswer(answerData: CdvqAnswerDto) {
    if (this.gameState !== CdvqState.RUNNING || this.currentQuestion === null || !this.startTime) {
      throw new BadRequestException('Cannot submit answer');
    }
    const isSubmitted = !!(await this.scoreRecordRepository.getByQuestionAndUser(
      answerData.username,
      this.currentQuestion.id,
    ));
    if (isSubmitted) {
      throw new BadRequestException('Already submitted');
    }
    const answer = answerData.answer;
    const isCorrect = this.currentQuestion.answer === answer;
    const currentTime = Date.now();
    await this.scoreRecordRepository.create({
      username: answerData.username,
      isCorrect: isCorrect,
      roundNumber: this.roundNumber,
      questionId: this.currentQuestion._id!.toHexString(),
      answerTime: currentTime - this.startTime,
    });
    return {
      message: 'Answer submitted',
    };
  }

  async calculateScore() {
    if (this.currentQuestion === null) {
      throw new BadRequestException('Cannot calculate answer');
    }
    const submissions = await this.scoreRecordRepository.getByQuestion(this.currentQuestion);
    let rank = 1;
    for (const submission of submissions) {
      let score = 10;
      if (submission.isCorrect) {
        const user = await this.userRepository.findUserByUsername(submission.username);
        if (!user) {
          throw new BadRequestException('User not found');
        }
        if (rank <= 5) score = 20;
        else if (rank <= 10) score = 15;
        await this.userRepository.increaseScore(user, score);
        rank++;
      }
    }
    return { message: 'Score calculated' };
  }

  async sendResult(): Promise<CdvqScore[]> {
    if (this.currentQuestion === null) {
      throw new BadRequestException('Cannot send result');
    }
    const result = await this.scoreRecordRepository.getRoundResult(this.currentQuestion);
    this.gameGateway.emitResult(result);
    return result;
  }

  getCurrentQuestion(): CdvqQuestion | null {
    if (this.currentQuestion === null) {
      throw new BadRequestException('No current question found');
    }
    return this.currentQuestion;
  }
}
