import { Test, TestingModule } from '@nestjs/testing';
import { TheGrandOrderGateway } from './the-grand-order.gateway';

describe('TheGrandOrderGateway', () => {
  let gateway: TheGrandOrderGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TheGrandOrderGateway],
    }).compile();

    gateway = module.get<TheGrandOrderGateway>(TheGrandOrderGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
