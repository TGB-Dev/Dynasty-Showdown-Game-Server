import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { SignupDto } from '../../dtos/signup.dto';

@Injectable()
export class SignupPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, metadata: ArgumentMetadata) {
    const errors: string[] = [];

    if (!this.isValueHasPassAndConfPass(value)) {
      throw new BadRequestException('Invalid request body');
    }

    if (value.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('\n'));
    }

    return value;
  }

  private isValueHasPassAndConfPass(value: unknown): value is SignupDto {
    return (
      value !== null &&
      typeof value === 'object' &&
      'password' in value &&
      typeof value.password === 'string' &&
      'confirmationPassword' in value &&
      typeof value.confirmationPassword === 'string'
    );
  }
}
