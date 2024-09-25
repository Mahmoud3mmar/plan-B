import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, Put, UseGuards, UseInterceptors, UploadedFile, BadRequestException, DefaultValuePipe, HttpStatus, HttpCode, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Course } from './entities/course.entity';
import { Roles } from '../auth/Roles.decorator';
import { Role } from '../user/common utils/Role.enum';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCoursesDto } from './dto/get.courses.dto';
import { PaginationDto } from '../review/dto/get.all.reviews.paginated.dto';

@ApiTags('course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiBody({
    description: 'Data to create a new course',
    type: CreateCourseDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The course has been successfully created.',
    type: Course,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data provided.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A course with the provided data already exists.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create the course due to an internal error.',
  })
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<Course> {
    return await this.courseService.createCourse(createCourseDto);

  }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // @Get()
  // @ApiOperation({ summary: 'Retrieve a list of courses with optional filters' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of courses with optional filters.',
  //   type: [Course],
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'No courses found matching the filters.',
  // // })
  // async findAllCourses(
  //   @Query('page') page: number,
  //   @Query('limit') limit: number,
  //   @Query('category') category?: string,
  //   @Query('instructorName') instructorName?: string,
  //   @Query('isPaid') isPaid?: boolean,
  //   @Query('rating') rating?: number,
  //   @Query('level') level?: string,
  // ): Promise<Course[]> {
  //   const filters = {
  //     category,
  //     instructorName,
  //     isPaid,
  //     rating,
  //     level,
  //   };
  //   return this.courseService.findAllCourses(page, limit, filters);
  // }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Put(':CourseId')
  // @UseGuards(AccessTokenGuard)

  // @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update a course by ID' })
  @ApiResponse({
    status: 200,
    description: 'The course has been successfully updated.',
    type: Course,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. The request payload is invalid.',
  })
  async update(
    @Param('CourseId') CourseId: string,
    @Body() updateCourseDto: UpdateCourseDto,
    // @UploadedFile() image: Express.Multer.File,

  ): Promise<Course> {
    // if (image) {
    //   // Upload the image and get the URL
    //   // Assume uploadImage is a method in your service that uploads to Cloudinary or another service
    //   const imageUrl = await this.courseService.uploadCourseImage(image);
    //   // Add the image URL to the DTO
    //   updateCourseDto.imageUrl = imageUrl;
    // }
    return this.courseService.updateCourse(CourseId, updateCourseDto);
  }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Post('upload/image/:courseId')
  // @UseGuards(AccessTokenGuard) // Add this line if authentication is needed
  @UseInterceptors(FileInterceptor('image'))
  async uploadCourseImage(
    @Param('courseId') courseId: string,
    @UploadedFile() image: Express.Multer.File
  ): Promise<any> {
    if (!image) {
      throw new BadRequestException('No image file provided');
    }

    try {
      return await this.courseService.uploadCourseImage(courseId, image);
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload image');
    }
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({
  summary: 'Delete a course',
  description: 'Deletes a course by its ID along with related entities such as videos, curriculums, FAQs, and reviews.',
})
@ApiParam({
  name: 'id',
  type: String,
  description: 'ID of the course to delete',
})
@ApiResponse({
  status: HttpStatus.NO_CONTENT,
  description: 'Course successfully deleted',
})
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'Course not found',
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Failed to delete the course',
})
async deleteCourse(@Param('id') courseId: string): Promise<void> {
  try {
    await this.courseService.deleteCourse(courseId);
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    } else {
      throw new InternalServerErrorException('Failed to delete course');
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@Get()
// @UseGuards(AccessTokenGuard)
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved courses with pagination and sorting',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Course' },
        },
        total: { type: 'number' },
        totalPages: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of courses per page' })
  @ApiQuery({ name: 'sortOrder', required: false, type: String, enum: ['asc', 'desc'], example: 'desc', description: 'Sort order for courses' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by course category' })
  @ApiQuery({ name: 'instructorName', required: false, type: String, description: 'Filter by instructor name' })
  @ApiQuery({ name: 'isPaid', required: false, type: String, enum: ['true', 'false'], description: 'Filter by whether the course is paid or free' })
  @ApiQuery({ name: 'rating', required: false, type: String, description: 'Filter by course rating' })
  @ApiQuery({ name: 'level', required: false, type: String, description: 'Filter by course level' })
  async getAllCourses(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sortOrder', new DefaultValuePipe('desc')) sortOrder: 'asc' | 'desc',
    @Query('category') category?: string,
    @Query('instructorName') instructorName?: string,
    @Query('isPaid') isPaid?: string,
    @Query('rating') rating?: string,
    @Query('level') level?: string
  ): Promise<{ data: Course[]; total: number; totalPages: number; page: number; limit: number }> {
    // Convert `isPaid` and `rating` to appropriate types
    const filters = {
      category,
      instructorName,
      isPaid: isPaid !== undefined ? isPaid === 'true' : undefined,
      rating: rating ? parseFloat(rating) : undefined,
      level,
    };

    // Validate page and limit
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be greater than 0');
    }

    const result = await this.courseService.findAllCourses(page, limit, sortOrder, filters);

    return {
      data: result.courses,
      total: result.total,
      totalPages: result.totalPages,
      page,
      limit,
    };
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Patch(':courseId')
  // @UseGuards(AccessTokenGuard)
  async assignInstructor(
    @Param('courseId') courseId: string,
    @Body('instructorId') instructorId: string,
  ) {
    return this.courseService.assignInstructorToCourse(courseId, instructorId);
  }
}