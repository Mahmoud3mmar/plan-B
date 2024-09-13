import { Transform } from 'class-transformer';
import { IsInt, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    description: 'The page number for pagination',
    example: 1,
    required: true,
  })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsInt({ message: 'Page must be an integer number' })
  @IsPositive({ message: 'Page must be greater than 0' })
  @Min(1, { message: 'Page must not be less than 1' })
  page?: number;

  @ApiProperty({
    description: 'The number of reviews per page',
    example: 10,
    required: true,
  })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsInt({ message: 'Limit must be an integer number' })
  @IsPositive({ message: 'Limit must be greater than 0' })
  @Min(1, { message: 'Limit must not be less than 1' })
  limit?: number;
}
