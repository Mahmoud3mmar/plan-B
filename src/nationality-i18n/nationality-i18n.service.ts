import { Injectable } from '@nestjs/common';
import nationalities from 'i18n-nationality';
import 'i18n-nationality/langs/en'; // Register English locale

@Injectable()
export class NationalityI18nService {
  constructor() {
    nationalities.registerLocale(require('i18n-nationality/langs/en.json'));
  }

  getAllNationalities(): { code: string; nationality: string }[] {
    const nationalityNames = nationalities.getNames('en');
    return Object.entries(nationalityNames).map(([code, nationality]) => ({
      code,
      nationality,
    }));
  }

  getNationalityByCode(code: string): string {
    return nationalities.getName(code, 'en');
  }
}
