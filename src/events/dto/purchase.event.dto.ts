import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PurchaseEventDto {
  @IsNotEmpty()
  @IsString()
  customerMobile: string;

    @IsOptional()
    @IsString()
    customerEmail?: string;

    @IsOptional()
    @IsString()
    customerName?: string;
} 