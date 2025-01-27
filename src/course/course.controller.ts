import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, Put, UseGuards, UseInterceptors, UploadedFile, BadRequestException, DefaultValuePipe, HttpStatus, HttpCode, NotFoundException, InternalServerErrorException, Res ,Request, ForbiddenException} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Course } from './entities/course.entity';
import { Roles } from '../auth/Roles.decorator';
import { Role } from '../user/common utils/Role.enum';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCoursesDto } from './dto/get.courses.dto';
import { PaginationDto } from '../review/dto/get.all.reviews.paginated.dto';
import { PurchaseCourseDto } from './dto/purchase.course.dto';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.ADMIN)  
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
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
    @UploadedFile() image: Express.Multer.File,
  ): Promise<Course> {
      // Check if an image was provided
      if (!image) {
        throw new BadRequestException('Image is required');
      }
    return await this.courseService.createCourse(createCourseDto,image);
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
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.ADMIN)  
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
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.ADMIN)  
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
@UseGuards(AccessTokenGuard,RolesGuard)
@Roles(Role.ADMIN)  
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
@ApiQuery({ name: 'page', required: false, description: 'Page number for pagination (optional)' })
@ApiQuery({ name: 'limit', required: false, description: 'Number of items per page (optional)' })
@ApiQuery({ name: 'sortOrder', enum: ['asc', 'desc'], description: 'Sort order (asc/desc)', required: false })
@ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
@ApiQuery({ name: 'instructorName', required: false, description: 'Filter by instructor name' })
@ApiQuery({ name: 'isPaid', type: Boolean, required: false, description: 'Filter by paid/free status' })
@ApiQuery({ name: 'rating', type: Number, required: false, description: 'Filter by rating (greater than or equal)' })
@ApiQuery({ name: 'level', required: false, description: 'Filter by course level' })
@ApiResponse({ status: 200, description: 'Successfully fetched courses', type: [Course] })
@ApiResponse({ status: 400, description: 'Bad Request' })
async findAllCourses(
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  @Query('categoryId') categoryId?: string,
  @Query('instructorName') instructorName?: string,
  @Query('isPaid') isPaid?: boolean,
  @Query('rating') rating?: number,
  @Query('level') level?: string,
) {
  try {
    const filters = { categoryId, instructorName, isPaid, rating, level };
    const result = await this.courseService.findAllCourses(page, limit, sortOrder, filters);
    return result;
  } catch (error) {
    throw new BadRequestException('Failed to fetch courses');
  }
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



  @Post(':id/purchase')
  @UseGuards(AccessTokenGuard)
  async purchaseCourse(
    @Param('id') id: string,
    @Body() purchaseDto: PurchaseCourseDto,
    @Request() req: any,
    @Res() res: Response
  ): Promise<any> {
    const user = req.user;
    const userId = user.sub; // Extract user ID from the JWT token

    // Set customer details from the user object
    purchaseDto.customerName = user.firstName + ' ' + user.lastName;
    purchaseDto.customerEmail = user.email;

    // Call the purchaseCourse method from the CourseService
    const redirectUrl = await this.courseService.purchaseCourse(id, purchaseDto, userId);
    
    // Return the redirect URL in the response
    return res.json({ redirectUrl });
  }


@Get(':id/view')
@UseGuards(AccessTokenGuard)
async viewCourse(
  @Param('id') id: string,
  @Request() req: any,
  @Res() res: Response
): Promise<any> {
  const user = req.user;
  const userId = user.sub; // Extract user ID from the JWT token

  // Check if the user has access to the course
  const hasAccess = await this.courseService.userHasAccessToCourse(id, userId);
  if (!hasAccess) {
    throw new ForbiddenException('You do not have access to this course');
  }

  // Retrieve the course details
  const course = await this.courseService.findOne(id);
  return res.json(course);
}
}