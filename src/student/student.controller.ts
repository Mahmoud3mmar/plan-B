import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, UploadedFile, UseInterceptors, Request, NotFoundException, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update.student.dto';
import { ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { Student } from './entities/student.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../auth/guards/role.guards';
import { Roles } from '../auth/Roles.decorator';
import { Role } from '../user/common utils/Role.enum';
import { Events } from '../events/entities/event.entity';
import { Course } from '../course/entities/course.entity';


@ApiTags('student')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('enroll/course/:courseId')
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.STUDENT)   
  @ApiOperation({
    summary: 'Enroll a student in a course',
    description: 'Enrolls a student in the specified course. Throws an error if the student is already enrolled or if the course does not exist.',
  })
  @ApiResponse({
    status: 200,
    description: 'The student has been successfully enrolled in the course.',
    type: Student,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or already enrolled in the course.',
  })
  @ApiResponse({
    status: 404,
    description: 'Student or course not found.',
  })
  async enrollInCourse(
    @Request() req: any,
    @Param('courseId') courseId:string,
  ): Promise<Student> {
    const studentId = req.user.sub; // Extract user ID from the JWT token
    // Check if the user exists
    if (!studentId) {
      throw new NotFoundException(`User with ID ${studentId} not found`);
    }
    return this.studentService.enrollInCourse(studentId, courseId);
  }
 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
 @Post('enroll/event/:eventId')
 @UseGuards(AccessTokenGuard)
 @HttpCode(HttpStatus.OK)
 @ApiOperation({ summary: 'Enroll a student in an event' })
 @ApiParam({
   name: 'studentId',
   description: 'The ID of the student enrolling in the event',
   type: String,
 })
 @ApiParam({
   name: 'eventId',
   description: 'The ID of the event to enroll in',
   type: String,
 })
 @ApiResponse({
   status: 200,
   description: 'Successfully enrolled in the event',
   type: Events,
 })
 @ApiResponse({
   status: 400,
   description: 'Bad Request - Invalid student ID or event ID, or student already enrolled',
 })
 @ApiResponse({
   status: 404,
   description: 'Not Found - Event or Student not found',
 })
 @ApiResponse({
   status: 500,
   description: 'Internal Server Error - Failed to enroll in the event',
 })
 async enrollInEvent(
  @Request() req: any,
  @Param('eventId') eventId: string
 ) {
   try {
    const studentId = req.user.sub; // Extract user ID from the JWT token
    // Check if the user exists
    if (!studentId) {
      throw new NotFoundException(`User with ID ${studentId} not found`);
    }
     return await this.studentService.enrollInEvent(studentId, eventId);
   } catch (error) {
     // Handle specific exceptions if needed
     throw new BadRequestException(error.message);
   }
 }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

  @Get('learning')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get enrolled courses for the student' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved enrolled courses.',
    type: [Course], // Assuming you have a Course DTO
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found.',
  })
  async getEnrolledCourses(@Request() req: any): Promise<Course[]> {
    const studentId = req.user.sub; // Extract user ID from the JWT token
    // Check if the user exists
    if (!studentId) {
      throw new NotFoundException(`User with ID ${studentId} not found`);
    }
    return this.studentService.getEnrolledCourses(studentId);
  }

}

