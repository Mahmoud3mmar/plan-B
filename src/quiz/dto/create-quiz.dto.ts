import { IsString, IsArray, IsNumber, ValidateNested, Min, Max, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class QuestionDto {
  @ApiProperty({
    description: 'The question text',
    example: 'What is the capital of France?'
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'Array of possible answers',
    example: ['London', 'Paris', 'Berlin', 'Madrid']
  })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];

  @ApiProperty({
    description: 'Index of the correct answer (0-based)',
    example: 1,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  correctAnswer: number;

  @ApiProperty({
    description: 'Explanation of the correct answer',
    example: 'Paris is the capital city of France.'
  })
  @IsString()
  explanation: string;
}

export class CreateQuizDto {
  @ApiProperty({
    description: 'Title of the quiz',
    example: 'European Capitals Quiz'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the quiz',
    example: 'Test your knowledge of European capital cities'
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Array of questions',
    type: [QuestionDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];

  @ApiProperty({
    description: 'Minimum score required to pass (percentage)',
    example: 70,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  passingScore: number;

  @ApiProperty({
    description: 'Time limit in minutes',
    example: 30,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  timeLimit: number;

  @ApiProperty({
    description: 'ID of the curriculum block this quiz belongs to',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  curriculumBlock: string;
}
