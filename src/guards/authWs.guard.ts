import { CanActivate, ExecutionContext, Injectable, Logger, mixin, Type, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/user.repository';
import { UserRole } from '../common/enum/roles.enum';
import { Socket } from 'socket.io';

export function AuthWsGuard(...roles: UserRole[]): Type<CanActivate> {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly userRepository: UserRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const client = context.switchToWs().getClient<Socket>();
      try {
        const token = this.extractTokenFromHeader(client);

        if (!token) {
          throw new UnauthorizedException();
        }

        const tokenData: { sub: string } = await this.jwtService.verifyAsync(token);
        const user = await this.userRepository.findUserByUsername(tokenData.sub);

        if (!user) throw new UnauthorizedException();

        if ((roles.length > 0 && roles.some((role) => role === user.role)) || !roles || roles.length === 0) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          client.data['user'] = user;
          return true;
        }

        throw new UnauthorizedException();
      } catch (error) {
        Logger.error(error);
        throw new UnauthorizedException();
      }
    }

    private extractTokenFromHeader(client: Socket): string | undefined {
      const [type, token] = client.handshake.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }

  return mixin(AuthGuardMixin);
}
