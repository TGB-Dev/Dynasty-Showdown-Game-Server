import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from '../dtos/signup.dto';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { argon2Options } from '../constants/argon2-options.const';
import { SigninDto } from '../dtos/signin.dto';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AuthorizationDto } from '../dtos/authorization.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findUser(username: string) {
    const res = await this.userModel.find({ username: username }).exec();
    if (res.length > 0) {
      return res[0];
    }
    return null;
  }

  async getUserProfile(username: string) {
    const res = await this.userModel.find({ username: username }, 'username teamName').exec();
    if (res.length > 0) {
      return res[0];
    }
    return null;
  }

  async createAccessToken(username: string): Promise<AuthorizationDto> {
    return {
      accessToken: await this.jwtService.signAsync({ sub: username }),
    };
  }

  async signup(newUser: SignupDto): Promise<AuthorizationDto> {
    if ((await this.findUser(newUser.username)) !== null) {
      throw new ConflictException(`User ${newUser.username} already exists`);
    }

    const user = new this.userModel({
      username: newUser.username,
      password: await argon2.hash(newUser.password, argon2Options),
      teamName: newUser.teamName,
    });

    await user.save();

    return await this.createAccessToken(user.username);
  }

  async signin(user: SigninDto): Promise<AuthorizationDto> {
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

      return await this.createAccessToken(user.username);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      throw new UnauthorizedException('Username or password is invalid. Please try again.');
    }
  }
}
