// update-summer-training.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsMongoId, IsNumber } from 'class-validator';
import { Level } from '../../course/utils/levels.enum';
import { CreateSummerTrainingDto } from './create.summertraining.dto';

export class UpdateSummerTrainingDto extends PartialType(CreateSummerTrainingDto) {
  @ApiPropertyOptional({
    description: 'Name of the summer training',
    example: 'Updated Advanced JavaScript Workshop',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Duration of the training (e.g., "6 weeks", "3 months")',
    example: '4 months',
  })
  @IsOptional()
  @IsString()
  duration?: string;



  @ApiPropertyOptional({
    description: 'Level of the training (e.g., "Beginner", "Intermediate", "Advanced")',
    enum: Level,
    example: Level.Intermediate,
  })
  @IsOptional()
  @IsEnum(Level)
  level?: Level;

  @ApiPropertyOptional({
    description: 'Type of training (either "online" or "offline")',
    enum: ['online', 'offline'],
    example: 'offline',
  })
  @IsOptional()
  @IsEnum(['online', 'offline'])
  type?: 'online' | 'offline';
}
