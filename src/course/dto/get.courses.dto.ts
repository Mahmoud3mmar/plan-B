    import { IsEnum, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
    import { ApiPropertyOptional } from '@nestjs/swagger';
    import { Level } from '../utils/levels.enum';

    export class GetCoursesDto {
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
    })
    @IsOptional()
    @IsNumber()
    page?: number;

    @ApiPropertyOptional({
        description: 'Limit of items per page for pagination',
        example: 10,
    })
    @IsOptional()
    @IsNumber()
    limit?: number;

    @ApiPropertyOptional({
        description: 'Filter by course level',
        enum: Level,
        example: Level.Beginner,
    })
    @IsOptional() 
    @IsEnum(Level)
    level?: Level;

    @ApiPropertyOptional({
        description: 'Filter by whether the course is paid or free',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isPaid?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by instructor name',
        example: 'John Doe',
    })
    @IsOptional()
    @IsString()
    instructorName?: string;

    @ApiPropertyOptional({
        description: 'Filter by course category',
        example: 'Nursing',
    })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({
        description: 'Filter by minimum rating',
        example: 4,
    })
    @IsOptional()
    @IsNumber()
    rating?: number;

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc';
    }
