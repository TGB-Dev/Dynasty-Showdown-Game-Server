import { Test, TestingModule } from '@nestjs/testing';
import { RiseOfKingdomGateway } from './rise-of-kingdom.gateway';

describe('RiseOfKingdomGateway', () => {
  let gateway: RiseOfKingdomGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiseOfKingdomGateway],
    }).compile();

    gateway = module.get<RiseOfKingdomGateway>(RiseOfKingdomGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
