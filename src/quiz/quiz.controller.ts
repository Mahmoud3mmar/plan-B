import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { AuthGuard } from '@nestjs/passport';
import { Student } from '../student/entities/student.entity';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { Role } from 'src/user/common utils/Role.enum';
import { Roles } from 'src/auth/Roles.decorator';

@ApiTags('Quizzes')
@ApiBearerAuth()
@Controller('quiz')
// @UseGuards(AccessTokenGuard,RolesGuard)
// @Roles(Role.STUDENT)  
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new quiz',
    description: 'Creates a new quiz with questions, options, and correct answers. Requires instructor privileges.'
  })
  @ApiBody({ 
    type: CreateQuizDto,
    description: 'Quiz creation data',
    examples: {
      example1: {
        value: {
          title: "Basic Mathematics",
          description: "Test your basic math skills",
          questions: [
            {
              question: "What is 2 + 2?",
              options: ["3", "4", "5", "6"],
              correctAnswer: 1,
              explanation: "2 plus 2 equals 4"
            }
          ],
          passingScore: 70,
          timeLimit: 30,
          curriculumBlock: "507f1f77bcf86cd799439011"
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Quiz has been successfully created',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all quizzes',
    description: 'Retrieves a list of all available quizzes'
  })
  @ApiResponse({
    status: 200,
    description: 'List of all quizzes',
  })
  findAll() {
    return this.quizService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific quiz',
    description: 'Retrieves a quiz by its ID'
  })
  @ApiParam({
    name: 'id',
    description: 'Quiz ID',
    required: true,
    type: String,
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'Quiz details retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Quiz not found',
  })
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a quiz',
    description: 'Updates an existing quiz by its ID. Requires instructor privileges.'
  })
  @ApiParam({
    name: 'id',
    description: 'Quiz ID',
    required: true,
    type: String,
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({ type: UpdateQuizDto })
  @ApiResponse({
    status: 200,
    description: 'Quiz has been successfully updated',
  })
  @ApiNotFoundResponse({
    description: 'Quiz not found',
  })
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a quiz',
    description: 'Deletes a quiz by its ID. Requires instructor privileges.'
  })
  @ApiParam({
    name: 'id',
    description: 'Quiz ID',
    required: true,
    type: String,
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'Quiz has been successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'Quiz not found',
  })
  remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }

  @Get('curriculum-block/:id')
  @ApiOperation({
    summary: 'Get quizzes by curriculum block',
    description: 'Retrieves all quizzes associated with a specific curriculum block'
  })
  @ApiParam({
    name: 'id',
    description: 'Curriculum Block ID',
    required: true,
    type: String,
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'List of quizzes for the curriculum block',
  })
  @ApiNotFoundResponse({
    description: 'Curriculum block not found',
  })
  findByCurriculumBlock(@Param('id') id: string) {
    return this.quizService.findByCurriculumBlock(id);
  }

  @Post('submit')
  @ApiOperation({
    summary: 'Submit quiz answers',
    description: 'Submit answers for a quiz and receive results'
  })
  @ApiBody({ 
    type: SubmitQuizDto,
    description: 'Quiz submission data',
    examples: {
      example1: {
        value: {
          quizId: "507f1f77bcf86cd799439011",
          answers: [
            { questionIndex: 0, selectedAnswer: 1 },
            { questionIndex: 1, selectedAnswer: 2 }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Quiz submitted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid submission or quiz already taken',
  })
  @ApiNotFoundResponse({
    description: 'Quiz or user not found',
  })
  submitQuiz(@Request() req: any, @Body() submitQuizDto: SubmitQuizDto) {
    const userId = "66e49e7411afc7d973670854"
    if (!userId) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return this.quizService.submitQuiz(userId, submitQuizDto);
  }

  @Get('results')
  @ApiOperation({
    summary: 'Get user quiz results',
    description: 'Retrieves all quiz results for the current user'
  })
  @ApiResponse({
    status: 200,
    description: 'List of user quiz results',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  getMyQuizResults(@Request() req: any) {
    const userId = "66e49e7411afc7d973670854"
    if (!userId) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return this.quizService.getStudentQuizResults(userId);
  }

  @Get('results/:quizId')
  @ApiOperation({
    summary: 'Get specific quiz result',
    description: 'Retrieves result for a specific quiz taken by the current user'
  })
  @ApiParam({
    name: 'quizId',
    description: 'Quiz ID',
    required: true,
    type: String,
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'Quiz result details',
  })
  @ApiNotFoundResponse({
    description: 'Quiz result or user not found',
  })
  getQuizResult(@Request() req: any, @Param('quizId') quizId: string) {
    const userId = "66e49e7411afc7d973670854"
    if (!userId) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return this.quizService.getQuizResult(userId, quizId);
  }
}
