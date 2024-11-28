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




  // @IsString()
  // image: string; // This will hold the URL/path of the image
  

}
