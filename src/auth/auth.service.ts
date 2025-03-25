import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from '../dtos/signup.dto';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { argon2Options } from '../constants/argon2options.const';
import { SigninDto } from '../dtos/signin.dto';
import { Model } from 'mongoose';
import { DbUser } from '../schemas/dbUser.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(DbUser.name) private dbUserModel: Model<DbUser>,
  ) {}

  async findUser(username: string) {
    const res = await this.dbUserModel.find({ username: username }).exec();
    if (res.length > 0) {
      return res[0];
    }
    return null;
  }

  createAccessToken(username: string): { accessToken: string } {
    return { accessToken: this.jwtService.sign({ sub: username }) };
  }

  async signup(newUser: SignupDto): Promise<{ accessToken: string }> {
    if ((await this.findUser(newUser.username)) !== null) {
      throw new ConflictException(`User ${newUser.username} already exists`);
    }

    const user = new this.dbUserModel({
      username: newUser.username,
      password: await argon2.hash(newUser.password, argon2Options),
      teamName: newUser.teamName,
    });

    await user.save();

    return this.createAccessToken(user.username);
  }

  async signin(user: SigninDto): Promise<{ accessToken: string }> {
    try {
      const existingUser = await this.findUser(user.username);
      // Do not return any detail about the authentication error to prevent attacks
      if (existingUser === null) {
        throw new Error();
      }

      const passwordMatch = await argon2.verify(existingUser.password, user.password, argon2Options);
      if (!passwordMatch) {
        throw new Error();
      }

      return this.createAccessToken(user.username);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      throw new UnauthorizedException('Username or password is invalid. Please try again.');
    }
  }
}
