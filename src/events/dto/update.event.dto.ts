import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({ description: 'Name of the event', required: false })
  @IsString()
  @IsOptional()
  eventName?: string;

  @ApiProperty({ description: 'Date of the event', required: false })
  @IsDateString()
  @IsOptional()
  eventDate?: string;

  @ApiProperty({ description: 'Description of the event', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Location of the event', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Name of the speaker', required: false })
  @IsString()
  @IsOptional()
  speakerName?: string;

  @ApiProperty({ description: 'Image URL of the speaker', required: false })
  @IsString()
  @IsOptional()
  speakerImage?: string;

  @ApiProperty({ description: 'Image URL of the thumbnail', required: false })
  @IsString()
  @IsOptional()
  thumbnailImage?: string;
}
