import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Level } from '../utils/levels.enum';
import { CourseCategory } from '../utils/course.category'; // Assuming you have a CourseCategory enum

export class UpdateCourseDto {
  @ApiPropertyOptional({
    description: 'The name of the course',
    example: 'Advanced NestJS',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'A brief overview of the course',
    example: 'An advanced course on NestJS covering advanced topics and best practices.',
  })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiPropertyOptional({
    description: 'The duration of the course in hours',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    description: 'The number of students enrolled in the course',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  studentsEnrolled?: number;

  @ApiPropertyOptional({
    description: 'The level of the course',
    enum: Level,
    example: Level.Intermediate,
  })
  @IsOptional()
  @IsEnum(Level)
  level?: Level;

  @ApiPropertyOptional({
    description: 'The number of lessons in the course',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  numberOfLessons?: number;

  @ApiPropertyOptional({
    description: 'The number of quizzes in the course',
    example: 7,
  })
  @IsOptional()
  @IsNumber()
  numberOfQuizzes?: number;

  @ApiPropertyOptional({
    description: 'The course curriculum',
    type: [String],
    example: ['Curriculum 1', 'Curriculum 2'],
  })
  @IsOptional()
  @IsString({ each: true })
  Coursecurriculum?: string[];

  @ApiPropertyOptional({
    description: 'The instructor ID',
    example: '605c72ef2f8fb8141c8e4e50',
  })
  @IsOptional()
  @IsString()
  instructor?: string;

  @ApiPropertyOptional({
    description: 'The FAQs related to the course',
    type: [String],
    example: ['FAQ 1', 'FAQ 2'],
  })
  @IsOptional()
  @IsString({ each: true })
  faqs?: string[];

  @ApiPropertyOptional({
    description: 'The reviews for the course',
    type: [String],
    example: ['Review 1', 'Review 2'],
  })
  @IsOptional()
  @IsString({ each: true })
  reviews?: string[];

  @ApiPropertyOptional({
    description: 'The price of the course',
    example: 149.99,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({
    description: 'Indicates if the course is paid or free',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional({
    description: 'The category of the course',
    example: 'Nursing',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'The rating of the course',
    example: 4.5,
  })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;
 
}
