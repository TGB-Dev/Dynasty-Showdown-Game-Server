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
import { TgoRoundState } from '../common/enum/tgo/tgo-round-state.enum';
import { CurrentQuestion } from '../common/interfaces/tgo.interface';

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
    if (this.tgoGameService.getRoundState() !== TgoRoundState.CHOOSING_AND_ANSWERING)
      throw new BadRequestException('You need to wait until choosing and answering phase begin');

    const questions = await this.tgoQuestionRepository.findAll();
    let tgoUserData = (await this.tgoUserDataRepository.findByUsername(username))?.toObject();

    if (!tgoUserData) {
      tgoUserData = (
        await this.tgoUserDataRepository.create({
          username,
          currentRound: this.tgoGameService.getCurrentRound(),
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

    const currentQuestions: CurrentQuestion[] = randomQuestions.map((questions) => {
      return {
        questionId: questions._id!.toHexString(),
        questionText: questions.questionText,
      };
    });

    // Set current questions
    await this.tgoUserDataRepository.setCurrentQuestions(username, currentQuestions);

    // Set current round
    await this.tgoUserDataRepository.setCurrentRound(username, this.tgoGameService.getCurrentRound());

    return {
      questions: currentQuestions,
    };
  }

  async getCurrentQuestions(username: string) {
    if (this.tgoGameService.getRoundState() !== TgoRoundState.CHOOSING_AND_ANSWERING)
      throw new BadRequestException('You need to wait until choosing and answering phase begin');

    const tgoUserData = (await this.tgoUserDataRepository.findByUsername(username))!.toObject();
    return tgoUserData.currentQuestions;
  }

  async submitAnswers(username: string, questionIds: string[]) {
    const lateSubmitted = this.tgoGameService.getRoundState() !== TgoRoundState.CHOOSING_AND_ANSWERING;

    const tgoUserData = (await this.tgoUserDataRepository.findByUsername(username))!;
    const user = (await this.userRepository.findUserByUsername(username))!;
    const currentQuestions = tgoUserData.currentQuestions;

    let isCorrect = true;
    const answers = await Promise.all(
      currentQuestions.map(async (question) => {
        const questionObject = await this.tgoQuestionRepository.findById(question.questionId);
        return questionObject!.answer;
      }),
    );
    const correctAnswers = answers.sort((a, b) => a - b);

    const submissionAnswers = await Promise.all(
      questionIds.map(async (questionId) => {
        const questionObject = await this.tgoQuestionRepository.findById(questionId);
        return questionObject!.answer;
      }),
    );

    console.log('correctAnswers', correctAnswers);
    console.log('submissionAnswers', submissionAnswers);

    if (correctAnswers !== submissionAnswers) isCorrect = false;

    if (lateSubmitted) isCorrect = false;

    if (isCorrect) {
      switch (submissionAnswers.length) {
        case TgoQuestionPack.PACK_3.valueOf():
          user.score += TgoQuestionPackScore.PACK_3;
          tgoUserData.changeOnScore = TgoQuestionPackScore.PACK_3;
          tgoUserData.attackScore = TgoQuestionPackPunishedScore.PACK_3;
          break;
        case TgoQuestionPack.PACK_5.valueOf():
          user.score += TgoQuestionPackScore.PACK_5;
          tgoUserData.changeOnScore = TgoQuestionPackScore.PACK_5;
          tgoUserData.attackScore = TgoQuestionPackPunishedScore.PACK_5;
          break;
        case TgoQuestionPack.PACK_7.valueOf():
          user.score += TgoQuestionPackScore.PACK_7;
          tgoUserData.changeOnScore = TgoQuestionPackScore.PACK_7;
          tgoUserData.attackScore = TgoQuestionPackPunishedScore.PACK_7;
          break;
      }
    } else {
      switch (submissionAnswers.length) {
        case TgoQuestionPack.PACK_3.valueOf():
          user.score += TgoQuestionPackPunishedScore.PACK_3;
          tgoUserData.changeOnScore = TgoQuestionPackPunishedScore.PACK_3;
          tgoUserData.attackScore = 0;
          break;
        case TgoQuestionPack.PACK_5.valueOf():
          user.score += TgoQuestionPackPunishedScore.PACK_5;
          tgoUserData.changeOnScore = TgoQuestionPackPunishedScore.PACK_5;
          tgoUserData.attackScore = 0;
          break;
        case TgoQuestionPack.PACK_7.valueOf():
          user.score += TgoQuestionPackPunishedScore.PACK_7;
          tgoUserData.changeOnScore = TgoQuestionPackPunishedScore.PACK_7;
          tgoUserData.attackScore = 0;
          break;
      }
    }

    await user.save();
    await tgoUserData.save();

    const correctQuestionIdsOrder = await Promise.all(
      correctAnswers.map(async (answer) => {
        const question = await this.tgoQuestionRepository.findByAnswer(answer);
        return question!._id.toHexString();
      }),
    );

    await this.tgoSubmissionRepository.create({
      username,
      answers: correctQuestionIdsOrder,
      correct: isCorrect,
    });

    return {
      correct: isCorrect,
    };
  }

  async getOpponents(username: string) {
    if (this.tgoGameService.getRoundState() !== TgoRoundState.ATTACKING_AND_SHOWING_RESULT)
      throw new BadRequestException('You need to wait until attacking and showing phase begin');

    const allTgoUserData = await this.tgoUserDataRepository.findAll();
    const opponents = allTgoUserData.filter((opponent) => opponent.username !== username);
    return opponents.map((opponent) => opponent.username);
  }

  async attackOpponent(username: string, opponentUsername: string) {
    if (this.tgoGameService.getRoundState() !== TgoRoundState.ATTACKING_AND_SHOWING_RESULT)
      throw new BadRequestException('You need to wait until attacking and showing phase begin');

    const tgoUserData = (await this.tgoUserDataRepository.findByUsername(username))!;
    const opponentUser = await this.userRepository.findUserByUsername(opponentUsername);

    if (!tgoUserData.canAttack) throw new BadRequestException("You don't have permission to attack");

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

  async canAttack(username: string) {
    const tgoUserData = (await this.tgoUserDataRepository.findByUsername(username))!;
    return tgoUserData.canAttack;
  }

  async getChangeOnScore(username: string) {
    const tgoUserData = (await this.tgoUserDataRepository.findByUsername(username))!;
    return tgoUserData.changeOnScore;
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
