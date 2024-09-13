import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  ParseIntPipe,
} from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { UpdateInstructorDto } from './dto/update.instructor.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Instructor } from './entities/instructor.entity';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../auth/guards/role.guards';
import { Role } from '../user/common utils/Role.enum';
import { Roles } from '../auth/Roles.decorator';

@ApiTags('instructor')
@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}



  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Retrieve a list of instructors with pagination and sorting' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the list of instructors',
    type: [Instructor],
  })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Number of items per page', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortOrder', description: 'Sort order (asc or desc)', required: false, enum: ['asc', 'desc'], example: 'asc' })
  // @Roles(Role.INSTRUCTOR)
  async getInstructors(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ data: Instructor[]; total: number }> {
    return this.instructorService.getInstructors(page, limit, sortOrder);
  }





  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get a specific instructor by ID' })
  @ApiResponse({
    status: 200,
    description: 'The instructor details',
    type: Instructor,
  })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  async findOne(@Param('id') id: string): Promise<Instructor> {
    return this.instructorService.findOne(id);
  }


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Put()
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.INSTRUCTOR) 
  @ApiOperation({ summary: 'Update an instructor by ID' })
  @ApiResponse({
    status: 200,
    description: 'The instructor has been successfully updated.',
    type: Instructor,
  })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  async update(
    @Body() updateInstructorDto: UpdateInstructorDto,
    @Request() req: any,
  ): Promise<Instructor> {
    // Extract user ID from request object
    const userId = req.user.sub;
    // Check if the user exists
    if (!userId) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    // Optional: Validate user access here, e.g., check if the user has permission to update this instructor
    return this.instructorService.updateInstructor(userId, updateInstructorDto);
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  @Post('profile/image')
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.INSTRUCTOR)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Upload a profile image for a specific instructor by ID',
  })
  @ApiResponse({
    status: 200,
    description:
      'The profile image has been successfully uploaded and updated.',
    type: Instructor,
  })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  async uploadProfileImage(
    @Request() req: any,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<any> {
    const userId = req.user.sub; // Extract user ID from the JWT token
    // Check if the user exists
    if (!userId) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return await this.instructorService.UploadProfileImage(userId, image);
  }







}
