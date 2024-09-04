import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, Put } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Course } from './entities/course.entity';

@ApiTags('course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  
  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
    description: 'The course has been successfully created.',
    type: Course,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. The request payload is invalid.',
  })
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve a list of courses with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of courses with optional filters.',
    type: [Course],
  })
  @ApiResponse({
    status: 404,
    description: 'No courses found matching the filters.',
  })
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
  @ApiOperation({ summary: 'Retrieve a course by its ID' })
  @ApiResponse({
    status: 200,
    description: 'The course has been successfully retrieved.',
    type: Course,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found.',
  })
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.courseService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course by its ID' })
  @ApiResponse({
    status: 200,
    description: 'The course has been successfully updated.',
    type: Course,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. The request payload is invalid.',
  })
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto): Promise<Course> {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course by its ID' })
  @ApiResponse({
    status: 204,
    description: 'The course has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found.',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.courseService.remove(id);
  }
}