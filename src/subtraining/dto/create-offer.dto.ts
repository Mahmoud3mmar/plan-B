import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDateString, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOfferDto {
  @ApiProperty({ description: 'New price for the training during offer' })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  offerPrice: number;

  @ApiProperty({ description: 'Start date of the offer' })
  @IsNotEmpty()
  @IsDateString()
  offerStartDate: Date;

  @ApiProperty({ description: 'End date of the offer' })
  @IsNotEmpty()
  @IsDateString()
  offerEndDate: Date;

  @ApiProperty({ description: 'Description of the offer' })
  @IsOptional()
  @IsString()
  offerDescription?: string;

  @ApiProperty({ description: 'Discount percentage' })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  discountPercentage: number;
} 