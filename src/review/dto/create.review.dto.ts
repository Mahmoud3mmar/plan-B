import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Comment for the review',
    example: 'This course was amazing!',
  })
  @IsNotEmpty()
  @IsString()
  comment: string;
  
  @ApiProperty({
    description: 'Rating for the course (out of 5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  
}
