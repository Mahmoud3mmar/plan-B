import { IsString, IsNumber, IsOptional } from 'class-validator';

export class PurchaseSubTrainingDto {
    // @IsString()
    // subTrainingId: string; // Ensure this is a string

    @IsString()
    customerMobile: string;

    @IsOptional()
    @IsString()
    customerEmail?: string;

    @IsOptional()
    @IsString()
    customerName?: string;

}