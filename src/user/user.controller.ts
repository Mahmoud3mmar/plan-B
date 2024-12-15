import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { createInstructorDto } from './dto/create.instructor.dto';
import { Instructor } from '../instructor/entities/instructor.entity';
@ApiTags('user')
@ApiBearerAuth() // Indicates that the endpoint requires a Bearer token for authorization
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Delete()
  // @UseGuards(AccessTokenGuard)
  // @ApiOperation({
  //   summary: 'Delete a user',
  //   description: 'Deletes the user based on the ID extracted from the JWT token.',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'User successfully deleted.',
  //   schema: {
  //     example: {
  //       message: 'User successfully deleted',
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 401,
  //   description: 'Unauthorized. User ID not found or invalid token.',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'User not found.',
  // })
  // async deleteUser(@Request() req: any): Promise<{ message: string }> {
  //   const userId = req.user.sub; // Extract user ID from the request
  //   if (!userId) {
  //     throw new UnauthorizedException('User ID not found');
  //   }

  //   await this.userService.deleteUser(userId);
  //   return { message: 'User successfully deleted' };
  // }








  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new instructor' })
  @ApiBody({
    description: 'Data to create a new instructor',
    type: createInstructorDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The instructor has been successfully created.',
    type: Instructor,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request. The input data is invalid.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - Instructor with this email already exists.',
  })
  async createInstructor(
    @Body() createInstructorDto: createInstructorDto,
  ): Promise<{ newInstructor: Instructor; message: string }> {
    // Call the instructor service to create an instructor
    return this.userService.createInstructor(createInstructorDto);
  }
}