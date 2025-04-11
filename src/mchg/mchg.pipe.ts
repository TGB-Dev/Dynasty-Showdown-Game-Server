import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class MchgImageValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File) {
    if (value === undefined) {
      throw new BadRequestException('Missing image for question');
    }

    return value;
  }
}
