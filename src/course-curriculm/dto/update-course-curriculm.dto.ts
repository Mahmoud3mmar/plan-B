import { PartialType } from '@nestjs/swagger';
import { CreateCourseCurriculmDto } from './create-course-curriculm.dto';

export class UpdateCourseCurriculmDto extends PartialType(CreateCourseCurriculmDto) {}
