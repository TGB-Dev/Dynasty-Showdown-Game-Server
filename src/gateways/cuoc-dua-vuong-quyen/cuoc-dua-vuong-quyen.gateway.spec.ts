import { Test, TestingModule } from '@nestjs/testing';
import { CuocDuaVuongQuyenGateway } from './cuoc-dua-vuong-quyen.gateway';

describe('CuocDuaVuongQuyenGateway', () => {
  let gateway: CuocDuaVuongQuyenGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuocDuaVuongQuyenGateway],
    }).compile();

    gateway = module.get<CuocDuaVuongQuyenGateway>(CuocDuaVuongQuyenGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
