import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, Put } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';
import { ApiTags } from '@nestjs/swagger';
import { Course } from './entities/course.entity';

@ApiTags('course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('category') category?: string,
    @Query('instructorName') instructorName?: string,
    @Query('isPaid') isPaid?: boolean,
    @Query('rating') rating?: number,
    @Query('level') level?: string,
  ): Promise<Course[]> {
    const filters = {
      category,
      instructorName,
      isPaid,
      rating,
      level,
    };
    return this.courseService.findAll(page, limit, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.courseService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto): Promise<Course> {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.courseService.remove(id);
  }
}