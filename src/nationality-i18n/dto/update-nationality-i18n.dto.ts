import { PartialType } from '@nestjs/swagger';
import { CreateNationalityI18nDto } from './create-nationality-i18n.dto';

export class UpdateNationalityI18nDto extends PartialType(CreateNationalityI18nDto) {}
