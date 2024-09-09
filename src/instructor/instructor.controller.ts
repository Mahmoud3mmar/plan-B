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
} from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { UpdateInstructorDto } from './dto/update.instructor.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Instructor } from './entities/instructor.entity';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('instructor')
@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  // @Post()
  // @ApiOperation({ summary: 'Create a new instructor' })
  // @ApiResponse({ status: 201, description: 'The instructor has been successfully created.', type: Instructor })
  // async create(@Body() createInstructorDto: CreateInstructorDto): Promise<Instructor> {
  //   return this.instructorService.create(createInstructorDto);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all instructors with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of instructors with pagination',
    type: [Instructor],
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: Instructor[]; total: number }> {
    return this.instructorService.findAll(page, limit);
  }

  @Get(':id')
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

  @Put()
  @UseGuards(AccessTokenGuard)
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

  @Post('profile/image')
  @UseGuards(AccessTokenGuard)
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
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific instructor by ID' })
  @ApiResponse({
    status: 204,
    description: 'The instructor has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.instructorService.remove(id);
  }
}
