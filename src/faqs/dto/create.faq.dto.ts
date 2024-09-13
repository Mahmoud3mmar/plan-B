import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
