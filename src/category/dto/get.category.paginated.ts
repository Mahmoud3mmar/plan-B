import { IsInt, IsOptional, Max, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'page must not be less than 1' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'limit must not be less than 1' })
  @Max(100, { message: 'limit must not be greater than 100' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => value.trim())
  sortField?: string = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'sortOrder must be either "asc" or "desc"' })
  @Transform(({ value }) => value.toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'asc';
}
