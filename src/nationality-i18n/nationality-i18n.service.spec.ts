import { Test, TestingModule } from '@nestjs/testing';
import { NationalityI18nService } from './nationality-i18n.service';

describe('NationalityI18nService', () => {
  let service: NationalityI18nService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NationalityI18nService],
    }).compile();

    service = module.get<NationalityI18nService>(NationalityI18nService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
