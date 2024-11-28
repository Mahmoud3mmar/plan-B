import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AgendaDto {
  @ApiProperty({ description: 'Title of the agenda item' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Time of the agenda item' })
  @IsString()
  @IsNotEmpty()
  time: string;
} 