import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSummerTrainingDto {
  @ApiProperty({ description: 'Title of the summer training' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the summer training' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Image file for the summer training', type: 'string', format: 'binary' })
  image?: Express.Multer.File; // Optional if you want to handle it in the controller
}