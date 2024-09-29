import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetCourseCurriculumDto {
  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Transform the value to a number
  page?: number = 1;

  @ApiProperty({ default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Transform the value to a number
  limit?: number = 10;
}
