import { CanActivate, ExecutionContext, Injectable, Logger, mixin, Type, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserRepository } from '../user/user.repository';
import { UserRole } from '../common/enum/roles.enum';

export function AuthGuard(...roles: UserRole[]): Type<CanActivate> {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly userRepository: UserRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      try {
        const token = this.extractTokenFromHeader(request);

        if (!token) {
          throw new UnauthorizedException();
        }

        const tokenData: { sub: string } = await this.jwtService.verifyAsync(token);
        const user = await this.userRepository.findUserByUsername(tokenData.sub);

        if (!user) throw new UnauthorizedException();

        if ((roles.length > 0 && roles.some((role) => role === user.role)) || !roles || roles.length === 0) {
          request['user'] = user;
          return true;
        }

        throw new UnauthorizedException();
      } catch (error) {
        Logger.error(error);
        throw new UnauthorizedException();
      }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }

  return mixin(AuthGuardMixin);
}
