import { Test, TestingModule } from '@nestjs/testing';
import { SummertrainingService } from './summertraining.service';

describe('SummertrainingService', () => {
  let service: SummertrainingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SummertrainingService],
    }).compile();

    service = module.get<SummertrainingService>(SummertrainingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
