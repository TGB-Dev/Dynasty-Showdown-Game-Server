import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from '../dtos/signup.dto';
import { User } from '../interfaces/user/user.interface';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { argon2Options } from '../constants/argon2options.const';
import { SigninDto } from '../dtos/signin.dto';

@Injectable()
export class AuthService {
  private users: User[] = [];

  constructor(private readonly jwtService: JwtService) {}

  findUser(username: string): User | undefined {
    return this.users.find((user) => user.username === username);
  }

  createAccessToken(username: string): { accessToken: string } {
    return { accessToken: this.jwtService.sign(username) };
  }

  async signup(newUser: SignupDto): Promise<{ accessToken: string }> {
    if (this.findUser(newUser.username)) {
      throw new ConflictException(`User ${newUser.username} already exists`);
    }

    const user: User = {
      username: newUser.username,
      password: await argon2.hash(newUser.password, argon2Options),
      teamName: newUser.teamName,
    };

    this.users.push(user);
    return this.createAccessToken(user.username);
  }

  async signin(user: SigninDto): Promise<{ accessToken: string }> {
    try {
      const existingUser = this.findUser(user.username);
      // Do not return any detail about the authentication error to prevent attacks
      if (!existingUser) {
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
