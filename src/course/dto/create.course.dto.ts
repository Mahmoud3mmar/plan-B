import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Level } from '../utils/levels.enum';


// DTO for creating a Course
export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  overview: string;

  @IsNotEmpty()
  @IsNumber()
  duration: number; // Duration in hours

  @IsNotEmpty()
  @IsNumber()
  studentsEnrolled: number;

  @IsEnum(Level)
  role:Level;


  @IsNotEmpty()
  @IsNumber()
  numberOfLessons: number;

  @IsNotEmpty()
  @IsNumber()
  numberOfQuizzes: number;

 

  @IsNotEmpty()
  @IsNumber()
  price: number; // Decimal value, represented as a number


  @IsOptional()
  @IsBoolean()
  isPaid?: boolean; // Indicates if the course is paid or free

  @IsNotEmpty()
  @IsString()
  category: string; // Category of the course


  @IsNotEmpty()
  @IsString()
  instructor: string; // Reference to Instructor ID
}
