import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import {User} from "../../interfaces/user/user.interface";

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = this.getRequest<{
      headers: Record<string, string | string[]>;
      user?: Record<string, unknown>;
    }>(context);
    try {
      const token = this.getToken(request);
      const user: User = this.jwtService.verify(token);
      // @ts-expect-error This is a quirk with the TS type system (somehow?)
      request['user'] = user;
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  protected getRequest<T>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest();
  }

  protected getToken(request: { headers: Record<string, string | string[]> }): string {
    const authorization = request.headers['Authorization'];
    if (!authorization || Array.isArray(authorization)) {
      throw new Error('Invalid Authorization header');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = authorization.split(' ');
    return token;
  }
}
