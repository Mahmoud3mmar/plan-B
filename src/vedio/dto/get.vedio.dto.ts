import { IsString, IsOptional, IsInt, Min, IsEnum, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetVideosDto {
  @IsNotEmpty({ message: 'courseId is required' })
  @IsString({ message: 'courseId must be a string' })
  courseId: string;

  @IsOptional()
  @IsInt({ message: 'page must be an integer number' })
  @Min(1, { message: 'page must not be less than 1' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  page: number = 1;

  @IsOptional()
  @IsInt({ message: 'limit must be an integer number' })
  @Min(1, { message: 'limit must not be less than 1' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  limit: number = 10;

  @IsOptional()
  @IsString({ message: 'sortBy must be a string' })
  @IsEnum(['uploadDate', 'title', 'duration'], { message: 'Invalid sortBy field' })
  sortBy: string = 'uploadDate';

  @IsOptional()
  @IsString({ message: 'sortOrder must be a string' })
  @IsEnum([SortOrder.ASC, SortOrder.DESC], { message: 'Invalid sortOrder value' })
  sortOrder: SortOrder = SortOrder.DESC;
}
