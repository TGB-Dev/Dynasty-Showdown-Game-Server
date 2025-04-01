import { Injectable } from '@nestjs/common';
import { MchgRepository } from './mchg.repository';
import { CreateRoundReqDto } from '../dtos/mchg.dto';
import { MchgRound } from '../schemas/mchg/mchgRound.schema';

@Injectable()
export class MchgService {
  constructor(private readonly mchgRepository: MchgRepository) {}

  createRound(roundDto: Omit<CreateRoundReqDto, 'image'> & { image: Express.Multer.File }) {
    const image = roundDto.image;

    const roundObject: MchgRound = {
      ...roundDto,
      image: {
        name: image.filename,
      },
    };

    return this.mchgRepository.createRound(roundObject);
  }
}
