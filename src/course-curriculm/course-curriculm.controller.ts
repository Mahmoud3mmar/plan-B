import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CourseCurriculmService } from './course-curriculm.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetCourseCurriculumDto } from './dto/get.course.curriculum.dto';
@ApiBearerAuth()
@ApiTags('coursecurriculm')
@Controller('course/curriculum')
export class CourseCurriculmController {
  constructor(private readonly courseCurriculmService: CourseCurriculmService) {}
  @Get(':courseId')
  async getCourseCurriculum(
    @Param('courseId') courseId: string,
    @Query() paginationDto: GetCourseCurriculumDto,
  ) {
    return this.courseCurriculmService.getCourseCurriculum(courseId, paginationDto);
  }
}
