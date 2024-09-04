import { Module } from '@nestjs/common';
import { CourseCurriculmService } from './course-curriculm.service';
import { CourseCurriculmController } from './course-curriculm.controller';

@Module({
  controllers: [CourseCurriculmController],
  providers: [CourseCurriculmService],
})
export class CourseCurriculmModule {}
