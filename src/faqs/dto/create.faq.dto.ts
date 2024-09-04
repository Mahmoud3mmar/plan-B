import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({
    description: 'The question of the FAQ',
    example: 'What is NestJS?',
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    description: 'The answer to the FAQ',
    example: 'NestJS is a framework for building efficient, scalable Node.js server-side applications.',
  })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiPropertyOptional({
    description: 'Optional reference to a course related to this FAQ',
    type: String,
    example: '605c72ef2f8fb8141c8e4e50',
  })
  @IsOptional()
  course?: Types.ObjectId; // Reference to Course document, optional for creation
}
