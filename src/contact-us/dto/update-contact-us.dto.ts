import { IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetContactUsDto {
    @ApiPropertyOptional({ 
        description: 'Page number',
        default: 1,
        type: Number 
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value) || 1)
    @IsNumber()
    page?: number = 1;
  
    @ApiPropertyOptional({ 
        description: 'Number of items per page',
        default: 10,
        type: Number 
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value) || 10)
    @IsNumber()
    limit?: number = 10;
}
