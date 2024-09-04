import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourseCurriculmService } from './course-curriculm.service';
import { CreateCourseCurriculmDto } from './dto/create-course-curriculm.dto';
import { UpdateCourseCurriculmDto } from './dto/update-course-curriculm.dto';

@Controller('course-curriculm')
export class CourseCurriculmController {
  constructor(private readonly courseCurriculmService: CourseCurriculmService) {}

  @Post()
  create(@Body() createCourseCurriculmDto: CreateCourseCurriculmDto) {
    return this.courseCurriculmService.create(createCourseCurriculmDto);
  }

  @Get()
  findAll() {
    return this.courseCurriculmService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseCurriculmService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseCurriculmDto: UpdateCourseCurriculmDto) {
    return this.courseCurriculmService.update(+id, updateCourseCurriculmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseCurriculmService.remove(+id);
  }
}
