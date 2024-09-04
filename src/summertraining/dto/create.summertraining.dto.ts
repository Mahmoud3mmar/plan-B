import { IsNotEmpty, IsString, IsEnum, IsOptional, IsArray, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { Level } from '../../course/utils/levels.enum';

export class CreateSummerTrainingDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsNotEmpty()
  @IsMongoId()
  instructor: string;

  @IsNotEmpty()
  @IsString()
  duration: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  students?: string[];

  @IsNotEmpty()
  numberOfStudentsEnrolled: number;

  @IsNotEmpty()
  @IsEnum(Level)
  level: Level;

  @IsOptional()
  @IsString()
  noOfLessons?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsEnum(['online', 'offline'])
  type: 'online' | 'offline';
}

