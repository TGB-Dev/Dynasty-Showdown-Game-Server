import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInReqDto, SignInResDto } from '../dtos/auth.dto';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async createAccessToken(username: string): Promise<SignInResDto> {
    return {
      accessToken: await this.jwtService.signAsync({ sub: username }),
    };
  }

  async signIn(user: SignInReqDto): Promise<SignInResDto> {
    try {
      const existingUser = await this.userRepository.findUserByUsername(user.username);
      if (existingUser === null) {
        throw new Error();
      }

      if (user.password === existingUser.password) {
        return await this.createAccessToken(user.username);
      } else {
        throw new Error();
      }
    } catch {
      throw new UnauthorizedException('Username or password is invalid. Please try again.');
    }
  }
}
