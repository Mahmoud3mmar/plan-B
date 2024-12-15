import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TopicDto {
  @ApiProperty({ description: 'Title of the agenda item' })
  @IsString()
  @IsNotEmpty()
  title: string;

} 