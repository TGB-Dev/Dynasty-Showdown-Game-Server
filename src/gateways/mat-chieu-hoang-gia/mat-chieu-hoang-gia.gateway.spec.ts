import { Test, TestingModule } from '@nestjs/testing';
import { MatChieuHoangGiaGateway } from './mat-chieu-hoang-gia.gateway';

describe('MatChieuHoangGiaGateway', () => {
  let gateway: MatChieuHoangGiaGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatChieuHoangGiaGateway],
    }).compile();

    gateway = module.get<MatChieuHoangGiaGateway>(MatChieuHoangGiaGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
