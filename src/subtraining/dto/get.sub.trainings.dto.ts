// dto/paginate.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class SubTrainingsPaginateDto {
  @ApiProperty({ description: 'Page number', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  limit: number;

  @ApiProperty({ description: 'ID of the summer training', example: '60d0fe4f5311236168a109ca' })
  @IsNotEmpty()
  summerTrainingId: Types.ObjectId;
}
