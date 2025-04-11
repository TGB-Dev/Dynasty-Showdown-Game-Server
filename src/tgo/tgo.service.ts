import { BadRequestException, Injectable } from '@nestjs/common';
import { TgoQuestionRepository } from './tgo-question.repository';
import { QuestionDto } from '../dtos/tgo.dto';
import { TgoUserDataRepository } from './tgo-user-data.repository';
import { TgoQuestion } from '../schemas/tgo/tgo-question.schema';
import { TgoSubmissionRepository } from './tgo-submission.repository';
import { UserRepository } from '../user/user.repository';
import { TgoQuestionPack } from '../common/enum/tgo/tgo-question-pack.enum';
import { TgoQuestionPackScore } from '../common/enum/tgo/tgo-question-pack-score.enum';
import { TgoQuestionPackPunishedScore } from '../common/enum/tgo/tgo-question-pack-punished-score.enum';
import { TgoGameService } from './tgo-game.service';

@Injectable()
export class TgoService {
  constructor(
    private readonly tgoQuestionRepository: TgoQuestionRepository,
    private readonly tgoUserDataRepository: TgoUserDataRepository,
    private readonly tgoSubmissionRepository: TgoSubmissionRepository,
    private readonly tgoGameService: TgoGameService,
    private readonly userRepository: UserRepository,
  ) {}

  async createQuestion(object: QuestionDto) {
    return this.tgoQuestionRepository.create(object);
  }

  async deleteQuestion(id: string) {
    return this.tgoQuestionRepository.delete(id);
  }

  async updateQuestion(id: string, questionDto: QuestionDto) {
    return this.tgoQuestionRepository.update(id, questionDto);
  }

  async getAllQuestions() {
    return this.tgoQuestionRepository.findAll();
  }

  async getQuestionById(id: string) {
    return this.tgoQuestionRepository.findById(id);
  }

  async generateQuestions(pack: number, username: string) {
    const questions = await this.tgoQuestionRepository.findAll();
    let tgoUserData = (await this.tgoUserDataRepository.findByUsername(username))?.toObject();

    if (!tgoUserData) {
      tgoUserData = (
        await this.tgoUserDataRepository.create({
          username,
        })
      ).toObject();
    }

    const filteredQuestions = questions
      .filter((question) => !tgoUserData.chosenQuestions.includes(question.toObject()._id.toHexString()))
      .map((question) => question.toObject());

    const randomQuestions: TgoQuestion[] = [];

    for (let i = 0; i < pack; i++) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      const question = filteredQuestions[randomIndex];
      randomQuestions.push(question);
      filteredQuestions.splice(randomIndex, 1);
    }

    // Add to chosen questions
    await Promise.all(
      randomQuestions.map(
        async (question) => await this.tgoUserDataRepository.addChosenQuestion(username, question._id!.toHexString()),
      ),
    );

    const sortedAnswers: number[] = randomQuestions.map((question) => question.answer).sort((a, b) => a - b);

    // Set current questions
    await this.tgoUserDataRepository.setCurrentQuestions(
      username,
      randomQuestions.map((question) => ({
        id: question._id!.toHexString(),
        questionText: question.questionText,
      })),
      sortedAnswers,
    );

    return {
      questions: randomQuestions.map((question) => ({
        id: question._id!.toHexString(),
        questionText: question.questionText,
      })),
      answers: sortedAnswers,
    };
  }

  async getCurrentQuestions(username: string) {
    const tgoUserData = (await this.tgoUserDataRepository.findByUsername(username))!.toObject();
    return tgoUserData.currentQuestions;
  }

  async submitAnswers(
    username: string,
    submissionPayload: {
      questionId: string;
      answer: number;
    }[],
  ) {
    const tgoUserData = (await this.tgoUserDataRepository.findByUsername(username))!;
    const user = (await this.userRepository.findUserByUsername(username))!;
    const currentQuestions = tgoUserData.toObject().currentQuestions.questions.map((question) => question.id);

    let isCorrect = true;
    for (const submission of submissionPayload) {
      const questionId = submission.questionId;
      const answer = submission.answer;

      if (!currentQuestions.includes(questionId)) {
        throw new BadRequestException('Invalid question ID');
      }

      const question = (await this.tgoQuestionRepository.findById(questionId))!.toObject();

      if (question.answer !== answer) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      switch (submissionPayload.length) {
        case TgoQuestionPack.PACK_3.valueOf():
          user.score += TgoQuestionPackScore.PACK_3;
          tgoUserData.attackScore = TgoQuestionPackPunishedScore.PACK_3;
          break;
        case TgoQuestionPack.PACK_5.valueOf():
          user.score += TgoQuestionPackScore.PACK_5;
          tgoUserData.attackScore = TgoQuestionPackPunishedScore.PACK_5;
          break;
        case TgoQuestionPack.PACK_7.valueOf():
          user.score += TgoQuestionPackScore.PACK_7;
          tgoUserData.attackScore = TgoQuestionPackPunishedScore.PACK_7;
          break;
      }
    } else {
      switch (submissionPayload.length) {
        case TgoQuestionPack.PACK_3.valueOf():
          user.score += TgoQuestionPackPunishedScore.PACK_3;
          tgoUserData.attackScore = 0;
          break;
        case TgoQuestionPack.PACK_5.valueOf():
          user.score += TgoQuestionPackPunishedScore.PACK_5;
          tgoUserData.attackScore = 0;
          break;
        case TgoQuestionPack.PACK_7.valueOf():
          user.score += TgoQuestionPackPunishedScore.PACK_7;
          tgoUserData.attackScore = 0;
          break;
      }
    }

    await user.save();
    await tgoUserData.save();

    await this.tgoSubmissionRepository.create({
      username,
      answers: submissionPayload,
      correct: isCorrect,
    });

    return {
      correct: isCorrect,
    };
  }

  async getOpponents(username: string) {
    const allTgoUserData = await this.tgoUserDataRepository.findAll();
    return allTgoUserData.filter((opponent) => opponent.username !== username);
  }

  async attackOpponent(username: string, opponentUsername: string) {
    const tgoUserData = (await this.tgoUserDataRepository.findByUsername(username))!;
    const opponentUser = await this.userRepository.findUserByUsername(opponentUsername);

    if (!opponentUser) {
      throw new BadRequestException('Opponent not found');
    }

    if (tgoUserData.attackScore === 0) throw new BadRequestException('You have no attack score to use');

    opponentUser.score += tgoUserData.attackScore;
    tgoUserData.attackScore = 0;

    await opponentUser.save();
    await tgoUserData.save();

    return {
      message: 'Opponent attack successful',
    };
  }

  startGame() {
    return this.tgoGameService.startGame();
  }

  stopGame() {
    return this.tgoGameService.stopGame();
  }

  pauseGame() {
    return this.tgoGameService.pauseGame();
  }

  resumeGame() {
    return this.tgoGameService.resumeGame();
  }
}
