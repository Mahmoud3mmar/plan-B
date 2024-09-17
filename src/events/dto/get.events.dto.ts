import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, IsEnum, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginateDto {
  @ApiProperty({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt({ message: 'Page must be an integer number' })
  @IsPositive({ message: 'Page must be a positive number' })
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer number' })
  @IsPositive({ message: 'Limit must be a positive number' })
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ description: 'Field to sort by', default: 'eventDate' })
  @IsOptional()
  @IsString()
  sort?: string = 'eventDate';

  @ApiProperty({ description: 'Sort order', enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'], { message: 'Order must be either "asc" or "desc"' })
  order?: 'asc' = 'asc';
}
