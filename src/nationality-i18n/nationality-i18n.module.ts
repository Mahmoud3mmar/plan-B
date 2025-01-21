import { Module } from '@nestjs/common';
import { NationalityI18nService } from './nationality-i18n.service';
import { NationalityI18nController } from './nationality-i18n.controller';

@Module({
  controllers: [NationalityI18nController],
  providers: [NationalityI18nService],
})
export class NationalityI18nModule {}
