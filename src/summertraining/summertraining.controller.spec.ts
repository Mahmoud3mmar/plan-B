import { Test, TestingModule } from '@nestjs/testing';
import { SummertrainingController } from './summertraining.controller';
import { SummertrainingService } from './summertraining.service';

describe('SummertrainingController', () => {
  let controller: SummertrainingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummertrainingController],
      providers: [SummertrainingService],
    }).compile();

    controller = module.get<SummertrainingController>(SummertrainingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
