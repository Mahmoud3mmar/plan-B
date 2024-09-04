import { IsNotEmpty, IsString, IsEnum, IsOptional, IsArray, IsMongoId, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Level } from '../../course/utils/levels.enum';

export class CreateSummerTrainingDto {
  @ApiProperty({
    description: 'Name of the summer training',
    example: 'Advanced JavaScript Workshop',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Image URL or path for the summer training',
    example: 'https://example.com/images/javascript-workshop.png',
  })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({
    description: 'Instructor ID who is leading the training',
    example: '605c72ef2f8fb8141c8e4e50',
  })
  @IsNotEmpty()
  @IsMongoId()
  instructor: string;

  @ApiProperty({
    description: 'Duration of the training (e.g., "6 weeks", "3 months")',
    example: '2 months',
  })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiPropertyOptional({
    description: 'Array of student IDs enrolled in the training',
    type: [String],
    example: ['605c72ef2f8fb8141c8e4e51', '605c72ef2f8fb8141c8e4e52'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  students?: string[];

  @ApiProperty({
    description: 'Number of students currently enrolled in the training',
    example: 25,
  })
  @IsNotEmpty()
  @IsNumber()
  numberOfStudentsEnrolled: number;

  @ApiProperty({
    description: 'Level of the training (e.g., "Beginner", "Intermediate", "Advanced")',
    enum: Level,
    example: Level.Intermediate,
  })
  @IsNotEmpty()
  @IsEnum(Level)
  level: Level;

  @ApiPropertyOptional({
    description: 'Optional number of lessons in the training',
    example: '10',
  })
  @IsOptional()
  @IsString()
  noOfLessons?: string;

  @ApiProperty({
    description: 'Category of the summer training',
    example: 'Programming',
  })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Type of training (either "online" or "offline")',
    enum: ['online', 'offline'],
    example: 'online',
  })
  @IsNotEmpty()
  @IsEnum(['online', 'offline'])
  type: 'online' | 'offline';
}
