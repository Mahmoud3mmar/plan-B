import { Test, TestingModule } from '@nestjs/testing';
import { NationalityI18nController } from './nationality-i18n.controller';
import { NationalityI18nService } from './nationality-i18n.service';

describe('NationalityI18nController', () => {
  let controller: NationalityI18nController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NationalityI18nController],
      providers: [NationalityI18nService],
    }).compile();

    controller = module.get<NationalityI18nController>(NationalityI18nController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
