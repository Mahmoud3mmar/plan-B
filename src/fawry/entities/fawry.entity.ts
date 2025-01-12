import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItem {
  @Prop({ required: true })
  @IsString()
  itemCode: string;

  @Prop({ required: true })
  @IsNumber()
  price: number;

  @Prop({ required: true })
  @IsNumber()
  quantity: number;
}

class ThreeDSInfo {
  @Prop({ required: false })
  @IsOptional()
  @IsString()
  eci?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  xid?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  enrolled?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  command?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  verSecurityLevel?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  verStatus?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  verType?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  verToken?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  version?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

class InvoiceInfo {
  @Prop({ required: false })
  @IsOptional()
  @IsString()
  number?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  businessRefNumber?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsNumber()
  expiryDate?: number;
}

@Schema()
export class FawryOrders extends Document {
  @Prop({ required: true })
  @IsString()
  requestId: string;

  @Prop({ required: true })
  @IsString()
  fawryRefNumber: string;

  @Prop({ required: true })
  @IsString()
  merchantRefNum: string; // Add this line

  @Prop({ required: true })
  @IsString()
  customerName: string;

  @Prop({ required: true })
  @IsString()
  customerMobile: string;

  @Prop({ required: true })
  @IsString()
  customerMail: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  customerMerchantId?: string;

  @Prop({ required: true })
  @IsNumber()
  paymentAmount: number;

  @Prop({ required: true })
  @IsNumber()
  orderAmount: number;

  @Prop({ required: true })
  @IsNumber()
  fawryFees: number;

  @Prop({ required: false })
  @IsOptional()
  @IsNumber()
  shippingFees?: number;

  @Prop({ required: true })
  @IsString()
  orderStatus: string;

  @Prop({ required: true })
  @IsString()
  paymentMethod: string;

  @Prop({ required: false })
  @IsOptional()
  @IsNumber()
  paymentTime?: number;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  authNumber?: string;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  paymentRefrenceNumber?: string;

  @Prop({ required: true })
  @IsNumber()
  orderExpiryDate: number;

  @Prop({ type: [OrderItem], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  orderItems: OrderItem[];

  @Prop({ required: false })
  @IsOptional()
  @IsNumber()
  failureErrorCode?: number;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  failureReason?: string;

  @Prop({ required: true })
  @IsString()
  messageSignature: string;

  @Prop({ type: ThreeDSInfo, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ThreeDSInfo)
  threeDSInfo?: ThreeDSInfo;

  @Prop({ type: InvoiceInfo, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceInfo)
  invoiceInfo?: InvoiceInfo;

  @Prop({ required: false })
  @IsOptional()
  @IsNumber()
  installmentInterestAmount?: number;

  @Prop({ required: false })
  @IsOptional()
  @IsNumber()
  installmentMonths?: number;
}

export const FawryOrdersSchema = SchemaFactory.createForClass(FawryOrders);