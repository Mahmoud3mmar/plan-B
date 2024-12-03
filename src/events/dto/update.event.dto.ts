import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNotEmpty, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateEventDto {
  @ApiProperty({ description: 'Name of the event', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  eventName?: string;

  @ApiProperty({ description: 'Date of the event', required: false })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiProperty({ description: 'Small description of the event', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  small_Description?: string;

  @ApiProperty({ description: 'Big description of the event', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  big_Description?: string;

  @ApiProperty({ description: 'Location name of the event', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location_Name?: string;

  @ApiProperty({ description: 'Latitude of the event location', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location_Lat?: string;

  @ApiProperty({ description: 'Longitude of the event location', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location_Long?: string;

  @ApiProperty({ description: 'Indicates if the event is paid', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isPaid?: boolean;

  @ApiProperty({ description: 'Price of the event', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return Number(value);
  })
  @IsNumber()
  price?: number;
}