import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SigninDto } from '../dtos/signin.dto';
import { AuthorizationDto } from '../dtos/authorization.dto';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async createAccessToken(username: string): Promise<AuthorizationDto> {
    return {
      accessToken: await this.jwtService.signAsync({ sub: username }),
    };
  }

  async signIn(user: SigninDto): Promise<AuthorizationDto> {
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
