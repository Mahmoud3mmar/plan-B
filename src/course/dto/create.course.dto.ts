import { IsEnum, IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Level } from '../utils/levels.enum';

// DTO for creating a Course
export class CreateCourseDto {
  @ApiProperty({
    description: 'The name of the course',
    example: 'Introduction to NestJS',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A brief overview of the course',
    example: 'This course provides an introduction to NestJS, a progressive Node.js framework.',
  })
  @IsNotEmpty()
  @IsString()
  overview: string;

  @ApiProperty({
    description: 'The role or level of the course',
    enum: Level,
    example: Level.Beginner,
  })
  @IsEnum(Level)
  level: Level; // Updated to reflect enum usage

  @ApiProperty({
    description: 'The number of lessons in the course',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  numberOfLessons: number;

  @ApiProperty({
    description: 'The number of quizzes in the course',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  numberOfQuizzes: number;

  @ApiProperty({
    description: 'The price of the course',
    example: 99.99,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number; // Decimal value, represented as a number

  @ApiPropertyOptional({
    description: 'Indicates if the course is paid or free',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean; // Indicates if the course is paid or free

  @ApiProperty({
    description: 'The category of the course',
    example: 'Web Development',
  })
  @IsNotEmpty()
  @IsString()
  category: string; // Category of the course

  @ApiProperty({
    description: 'Reference to Instructor ID',
    example: '605c72ef2f8fb8141c8e4e50',
  })
  @IsNotEmpty()
  @IsString()
  instructor: string; // Reference to Instructor ID
}
