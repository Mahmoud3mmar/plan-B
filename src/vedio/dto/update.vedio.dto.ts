import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateVideoDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  course?: string; // Assuming course ID as a string

  @IsNumber()
  @IsOptional()
  views?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
