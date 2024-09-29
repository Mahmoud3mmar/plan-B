import { PartialType } from '@nestjs/swagger';
import { CreateCurriculumBlockDto } from './create.curriculum.block.dto';

export class UpdateCurriculumBlockDto extends PartialType(CreateCurriculumBlockDto) {}
