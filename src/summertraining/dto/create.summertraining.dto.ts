import { IsNotEmpty, IsString, IsEnum, IsOptional, IsArray, IsMongoId, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Level } from '../../course/utils/levels.enum';

export class CreateSummerTrainingDto {
  @ApiProperty({
    description: 'Name of the summer training',
    example: 'Advanced JavaScript Workshop',
  })
  @IsNotEmpty()
  @IsString()
  name: string;




  @ApiProperty({
    description: 'Duration of the training (e.g., "6 weeks", "3 months")',
    example: '2 months',
  })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiPropertyOptional({
    description: 'Array of student IDs enrolled in the training',
    type: [String],
    example: ['605c72ef2f8fb8141c8e4e51', '605c72ef2f8fb8141c8e4e52'],
  })

 

  @ApiProperty({
    description: 'Level of the training (e.g., "Beginner", "Intermediate", "Advanced")',
    enum: Level,
    example: Level.Intermediate,
  })
  @IsNotEmpty()
  @IsEnum(Level)
  level: Level;

  @IsOptional() // Make the image optional
  @IsString()
  image?: string; // This will hold the URL/path of the image
  
  @ApiProperty({
    description: 'Type of training (either "online" or "offline")',
    enum: ['online', 'offline'],
    example: 'online',
  })
  @IsNotEmpty()
  @IsEnum(['online', 'offline'])
  type: 'online' | 'offline';
}
