import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsEnum, IsOptional, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { trainingLevel } from '../entities/subtraining.entity';

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

  @ApiProperty({ description: 'Level of the sub-training', enum: trainingLevel })
  @IsNotEmpty()
  @IsEnum(trainingLevel)
  level: trainingLevel;

  @ApiProperty({ description: 'Is the sub-training paid or not?' })
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPaid: boolean;


  
  @ApiProperty({ description: 'Is the sub-training has offer or not?' })
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasOffer: boolean;

  @ApiProperty({ description: 'Price of the sub-training', required: false })
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsNumber()
  price?: number;
  // @ApiProperty({ description: 'Image URL for the sub-training', required: true })
  // @IsNotEmpty()
  // @IsString()
  // image: string; // URL to the image

  @ApiProperty({ description: 'Description of the sub-training', required: true })
  @IsNotEmpty()
  @IsString()
  description: string; // Description of the sub-training

  @ApiProperty({ description: 'Location name of the sub-training', required: true })
  @IsNotEmpty()
  @IsString()
  location_Name: string; // Location name

  @ApiProperty({ description: 'Location latitude of the sub-training', required: true })
  @IsNotEmpty()
  @IsString()
  location_Lat: string; // Location latitude

  @ApiProperty({ description: 'Location longitude of the sub-training', required: true })
  @IsNotEmpty()
  @IsString()
  location_Long: string; // Location longitude

  @ApiProperty({ description: 'Total number of seats available for the sub-training', required: true })
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  seats: number; // Total number of seats

  @ApiProperty({ description: 'Type of the sub-training (online or offline)', enum: ['online', 'offline'], required: true })
  @IsNotEmpty()
  @IsEnum(['online', 'offline'])
  type: 'online' | 'offline'; // Training mode

  @ApiProperty({ 
    description: 'Topics covered in the training (comma-separated)',
    example: 'HTML,CSS,JavaScript'
  })
  @IsNotEmpty()
  @Transform(({ value }) => {
    // Handle comma-separated string
    if (typeof value === 'string') {
      return value.split(',').map(topic => topic.trim());
    }
    // Handle array
    if (Array.isArray(value)) {
      return value;
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  topics: string[];

  @ApiProperty({ description: 'ID of the summer training the sub-training belongs to' })
  @IsNotEmpty()
  summerTraining: Types.ObjectId; // Reference to the SummerTrainingEntity
}
