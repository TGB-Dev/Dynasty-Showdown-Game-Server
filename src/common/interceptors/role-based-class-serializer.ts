import {
  CallHandler,
  ClassSerializerInterceptor,
  ExecutionContext,
  Injectable,
  PlainLiteralObject,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { AuthRequest } from '../interfaces/request.interface';
import { UserRole } from '../enum/roles.enum';

@Injectable()
export class RoleBasedClassSerializer extends ClassSerializerInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const contextOptions = this.getContextOptions(context);
    const options = {
      ...this.defaultOptions,
      ...contextOptions,
      enableCircularCheck: true,
      excludeExtraneousValues: true,
      groups: [req.user?.role ?? UserRole.PUBLIC_VIEW],
    };

    return next.handle().pipe(
      map((res: PlainLiteralObject | Array<PlainLiteralObject>) => {
        return this.serialize(res, options);
      }),
    );
  }
}
