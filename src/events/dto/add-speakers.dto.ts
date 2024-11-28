import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddSpeakerDto {
  @ApiProperty({ description: 'Name of the speaker' })
  @IsString()
  @IsNotEmpty()
  name: string;


  @ApiProperty({ description: 'Description about the speaker' })
  @IsString()
  @IsNotEmpty()
  about: string;
} 