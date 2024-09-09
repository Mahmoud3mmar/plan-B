import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, UploadedFile, UseInterceptors, Request, NotFoundException, Put } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update.student.dto';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { Student } from './entities/student.entity';
import { FileInterceptor } from '@nestjs/platform-express';


@ApiTags('student')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // @Get()
  // @ApiOperation({ summary: 'Get all students', description: 'Retrieve a paginated list of students.' })
  // @ApiResponse({ status: 200, description: 'Successfully retrieved students list.' })
  // @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // async findAll(): Promise<{ data: Student[], total: number }> {
  //   const { page = 1, limit = 10 } = req.query;
  //   return this.studentService.findAll(Number(page), Number(limit));
  // }

  // @Get(':id')
  // @ApiOperation({ summary: 'Get student by ID', description: 'Retrieve a student by their ID.' })
  // @ApiResponse({ status: 200, description: 'Successfully retrieved student.' })
  // @ApiResponse({ status: 404, description: 'Student not found' })
  // @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // async findOne(@Param('id') id: string): Promise<Student> {
  //   return this.studentService.findOne(id);
  // }

  @Put()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update student', description: 'Update student details by their ID.' })
  @ApiResponse({ status: 200, description: 'Successfully updated student.' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateStudent(
    @Request() req: any,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const userId = req.user.sub; // Extract user ID from the JWT token
    // Check if the user exists
    if (!userId) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return this.studentService.updateStudent(userId, updateStudentDto);
  }

  @Post('profile/image')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload profile image', description: 'Upload a profile image for a student.' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Successfully uploaded profile image.' })
  @ApiResponse({ status: 400, description: 'Invalid file or request.' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async uploadProfileImage(
    @Request() req: any,

    @UploadedFile() image: Express.Multer.File,
  ): Promise<Student> {
    if (!image) {
      throw new BadRequestException('File is required.');
    }
    const userId = req.user.sub; // Extract user ID from the JWT token
    // Check if the user exists
    if (!userId) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return this.studentService.uploadProfileImage(userId, image);
  }


}

