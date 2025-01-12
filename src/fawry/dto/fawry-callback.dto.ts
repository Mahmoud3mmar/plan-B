import { IsString, IsNumber, IsEmail, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  itemCode: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;
}

class ThreeDSInfoDto {
  @IsString()
  eci: string;

  @IsString()
  xid: string;

  @IsString()
  enrolled: string;

  @IsString()
  status: string;

  @IsString()
  batchNumber: string;

  @IsString()
  command: string;

  @IsString()
  message: string;

  @IsString()
  verSecurityLevel: string;

  @IsString()
  verStatus: string;

  @IsString()
  verType: string;

  @IsString()
  verToken: string;

  @IsString()
  version: string;

  @IsString()
  receiptNumber: string;

  @IsString()
  sessionId: string;
}

class InvoiceInfoDto {
  @IsString()
  number: string;

  @IsString()
  businessRefNumber: string;

  @IsString()
  dueDate: string;

  @IsNumber()
  expiryDate: number;
}

export class FawryCallbackDto {
  @IsString()
  requestId: string;

  @IsString()
  fawryRefNumber: string;

  @IsString()
  merchantRefNumber: string;

  @IsString()
  customerName: string;

  @IsString()
  customerMobile: string;

  @IsEmail()
  customerMail: string;

  @IsOptional()
  @IsString()
  customerMerchantId?: string;

  @IsNumber()
  paymentAmount: number;

  @IsNumber()
  orderAmount: number;

  @IsNumber()
  fawryFees: number;

  @IsOptional()
  @IsNumber()
  shippingFees?: number;

  @IsString()
  orderStatus: string;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsNumber()
  paymentTime?: number;

  @IsOptional()
  @IsString()
  authNumber?: string;

  @IsOptional()
  @IsString()
  paymentRefrenceNumber?: string;

  @IsNumber()
  orderExpiryDate: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @IsOptional()
  @IsNumber()
  failureErrorCode?: number;

  @IsOptional()
  @IsString()
  failureReason?: string;

  @IsString() // Add this line
  messageSignature: string; // Add this line

  @IsOptional()
  @ValidateNested()
  @Type(() => ThreeDSInfoDto)
  threeDSInfo?: ThreeDSInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceInfoDto)
  invoiceInfo?: InvoiceInfoDto;

  @IsOptional()
  @IsNumber()
  installmentInterestAmount?: number;

  @IsOptional()
  @IsNumber()
  installmentMonths?: number;
}