import { Injectable } from '@nestjs/common';
import { RokRepository } from './rok.repository';

@Injectable()
export class RokService {
  constructor(private readonly rokRepository: RokRepository) {}
}
