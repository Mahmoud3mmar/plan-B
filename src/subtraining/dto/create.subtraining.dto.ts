import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Level } from '../../course/utils/levels.enum';
import { Types } from 'mongoose';

export class CreateSubTrainingDto {
  @ApiProperty({ description: 'Name of the sub-training' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'ID of the instructor for the sub-training' })
  @IsNotEmpty()
  instructor: Types.ObjectId; // Reference to the instructor teaching the sub-training

  @ApiProperty({ description: 'Duration of the sub-training (e.g., 4 weeks, 2 months)' })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiProperty({ description: 'Number of lessons in the sub-training', example: 10 })
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  numberOfLessons: number;


  @ApiProperty({ description: 'Level of the sub-training', enum: Level })
  @IsNotEmpty()
  @IsEnum(Level)
  level: Level;

  @ApiProperty({ description: 'Is the sub-training paid or not?' })
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPaid: boolean;

  @ApiProperty({ description: 'ID of the summer training the sub-training belongs to' })
  @IsNotEmpty()
  summerTraining: Types.ObjectId; // Reference to the SummerTrainingEntity
}
