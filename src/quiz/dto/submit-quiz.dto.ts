import { IsArray, IsString, IsNumber, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class QuizAnswerDto {
  @ApiProperty({
    description: 'Index of the question being answered',
    example: 0,
    type: Number
  })
  @IsNumber()
  questionIndex: number;

  @ApiProperty({
    description: 'Index of the selected answer',
    example: 2,
    type: Number
  })
  @IsNumber()
  selectedAnswer: number;
}

export class SubmitQuizDto {
  @ApiProperty({
    description: 'ID of the quiz being submitted',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  quizId: string;

  @ApiProperty({
    description: 'Array of answers for each question',
    type: [QuizAnswerDto],
    example: [
      { questionIndex: 0, selectedAnswer: 1 },
      { questionIndex: 1, selectedAnswer: 2 }
    ]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
} 