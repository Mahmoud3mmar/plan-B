import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, Put, UseGuards, UseInterceptors, UploadedFile, BadRequestException, DefaultValuePipe } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Course } from './entities/course.entity';
import { Roles } from '../auth/Roles.decorator';
import { Role } from '../user/common utils/Role.enum';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCoursesDto } from './dto/get.courses.dto';

@ApiTags('course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  // @Roles(Role.STUDENT)
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
  @ApiQuery({
    name: 'instructorId',
    description: 'Optional ID for the course',
    required: false,
    type: String,
  })
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @Query('instructorId') instructorId?: string,
  ): Promise<Course> {
    // Optionally add the ID to the DTO if provided
    
    return this.courseService.createCourse(createCourseDto,instructorId);
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
  @Put()
  @UseGuards(AccessTokenGuard)

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
    @Query('CourseId') CourseId: string,
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
  @Post('upload/image')
  @UseGuards(AccessTokenGuard) // Add this line if authentication is needed
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload an image for a course' })
  @ApiResponse({
    status: 201,
    description: 'The image has been successfully uploaded.',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. The request payload is invalid.',
  })
  async uploadCourseImage(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<any> {
    if (!image) {
      throw new BadRequestException('No image file provided');
    }

    return await this.courseService.uploadCourseImage(image);
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
@Get()
async getAllCourses(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  @Query('sortOrder', new DefaultValuePipe('desc')) sortOrder: 'asc' | 'desc',
  @Query('category') category?: string,
  @Query('instructorName') instructorName?: string,
  @Query('isPaid') isPaid?: string,
  @Query('rating') rating?: string,
  @Query('level') level?: string
): Promise<Course[]> {
  // Convert `isPaid` and `rating` to appropriate types
  const filters = {
    category,
    instructorName,
    isPaid: isPaid !== undefined ? isPaid === 'true' : undefined,
    rating: rating ? parseFloat(rating) : undefined,
    level,
  };

  return this.courseService.findAllCourses(page, limit,  sortOrder, filters);
}
}