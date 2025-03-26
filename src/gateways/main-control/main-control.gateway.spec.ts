import { Test, TestingModule } from '@nestjs/testing';
import { MainControlGateway } from './main-control.gateway';

describe('MainControlGateway', () => {
  let gateway: MainControlGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainControlGateway],
    }).compile();

    gateway = module.get<MainControlGateway>(MainControlGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
