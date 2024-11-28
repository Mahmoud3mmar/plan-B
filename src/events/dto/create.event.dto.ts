import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNotEmpty, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({ description: 'Name of the event' })
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @ApiProperty({ description: 'Date of the event' })
  @IsDateString()
  @IsNotEmpty()
  eventDate: string;

  @ApiProperty({ description: 'Small description of the event' })
  @IsString()
  @IsNotEmpty()
  small_Description: string;

  @ApiProperty({ description: 'Big description of the event' })
  @IsString()
  @IsNotEmpty()
  big_Description: string;

  @ApiProperty({ description: 'Location name of the event' })
  @IsString()
  @IsNotEmpty()
  location_Name: string;

  @ApiProperty({ description: 'Latitude of the event location' })
  @IsString()
  @IsNotEmpty()
  location_Lat: string;

  @ApiProperty({ description: 'Longitude of the event location' })
  @IsString()
  @IsNotEmpty()
  location_Long: string;

  @ApiProperty({ description: 'Indicates if the event is paid', type: Boolean })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isPaid: boolean;

  @ApiProperty({ description: 'Price of the event', required: false, type: Number })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return Number(value);
  })
  @IsNumber()
  price?: number;

  @ApiProperty({ description: 'URL to the event\'s thumbnail image', required: false })
  @IsOptional()
  @IsString()
  image?: string;
}