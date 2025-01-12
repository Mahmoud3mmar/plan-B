import { IsString, IsNumber } from 'class-validator';

export class PurchaseSubTrainingDto {
    // @IsString()
    // subTrainingId: string; // Ensure this is a string

    @IsString()
    customerMobile: string;

    @IsString()
    customerEmail: string;

    @IsString()
    customerName: string;

}