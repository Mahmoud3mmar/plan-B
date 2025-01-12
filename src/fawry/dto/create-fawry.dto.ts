import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseType } from '../PurchaseTypeEnum';

class ChargeItem {
    @IsString()
    itemId: string;

    @IsString()
    description: string;

    @IsNumber()
    price: number;

    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}

export class CreateChargeRequestDto {

    @IsOptional()
    @IsString()
    merchantCode?: string;



    @IsOptional()
    @IsString()
    merchantRefNum?: string;

    @IsString()
    customerMobile: string;

    @IsString()
    customerEmail: string;

    @IsString()
    customerName: string;

    @IsOptional()
    @IsString()
    customerProfileId?: string;

    @IsOptional()
    @IsNumber()
    paymentExpiry?: number;

    @IsString()
    language: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChargeItem) // Use class-transformer to handle nested objects
    chargeItems: ChargeItem[];

    @IsString()
    returnUrl: string;

    @IsOptional()
    @IsBoolean()
    authCaptureModePayment?: boolean;

    @IsOptional()
    @IsString()
    signature?: string; // Optional if you are generating it in the service

    @IsEnum(PurchaseType, { message: 'purchaseType must be a valid PurchaseType' })
    purchaseType: PurchaseType; // Use the enum here

}