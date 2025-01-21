import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NationalityI18nService } from './nationality-i18n.service';
import { CreateNationalityI18nDto } from './dto/create-nationality-i18n.dto';
import { UpdateNationalityI18nDto } from './dto/update-nationality-i18n.dto';

@Controller('nationality')
export class NationalityI18nController {
  constructor(private readonly nationalityI18nService: NationalityI18nService) {}

  @Get()
  getAllNationalities() {
    return this.nationalityI18nService.getAllNationalities();
  }

  @Get(':code')
  getNationalityByCode(@Param('code') code: string) {
    return this.nationalityI18nService.getNationalityByCode(code);
  }
}
