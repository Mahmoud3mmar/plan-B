// src/summer-training/dto/get-summer-training.dto.ts
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Level } from '../../course/utils/levels.enum';

export class GetSummerTrainingDto {
  @IsOptional()
  @IsEnum(Level)
  level?: Level; // Optional filter by level

  @IsOptional()
  @IsString()
  type?: 'online' | 'offline'; // Optional filter by type

  @IsOptional()
  @IsString()
  page?: string; // Optional pagination page number

  @IsOptional()
  @IsString()
  limit?: string; // Optional pagination limit
}
