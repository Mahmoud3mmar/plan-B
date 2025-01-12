import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { CreateChargeRequestDto } from './dto/create-fawry.dto';
import { FawryCallbackDto } from './dto/fawry-callback.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FawryOrders } from './entities/fawry.entity';

// interface ChargeItem {
//   itemId: string;
//   quantity: number;
//   price: number;
// }

// interface PaymentData {
//   merchantRefNum: string;
//   customerMobile: string;
//   customerEmail: string;
//   customerName: string;
  
//   customerProfileId?: string;
//   // paymentExpiry: string;
//   language?: string;
//   chargeItems: ChargeItem[];
//   returnUrl: string;
// }

@Injectable()
export class FawryService {
  constructor(
    
    @InjectModel(FawryOrders.name) private readonly fawryModel: Model<FawryOrders>,

    
  ) {}
  // constructor(@InjectModel(Order.name) private readonly orderModel: Model<Order>) {}

  // private readonly baseUrl: string;
  // private readonly merchantCode: string;
  // private readonly securityKey: string;

  // constructor(private readonly configService: ConfigService) {
  //   this.baseUrl = this.configService.get<string>('FAWRY_BASE_URL', '');
  //   this.merchantCode = this.configService.get<string>('FAWRY_MERCHANT_CODE', '');
  //   this.securityKey = this.configService.get<string>('FAWRY_SECURITY_KEY', '');
  // }

  // async initiatePayment(paymentData: PaymentData): Promise<any> {
  //   const endpoint = `${this.baseUrl}/ECommerceWeb/api/payments/charge`;

  //   // Build charge request
  //   const chargeRequest = this.buildChargeRequest(paymentData);

  //   console.log('Request Body:', JSON.stringify(chargeRequest, null, 2));

  //   try {
  //     const response = await axios.post(endpoint, chargeRequest, {
  //       headers: { 'Content-Type': 'application/json' },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.description || error.message;
  //     throw new Error(`Fawry API error: ${errorMessage}`);
  //   }
  // }

  // private generateSignature(paymentData: any): string {
  //   // Sort chargeItems by itemId
  //   const sortedItems = [...paymentData.chargeItems].sort((a, b) => 
  //       a.itemId.localeCompare(b.itemId)
  //   );

  //   // Create items string with proper format
  //   const itemsString = sortedItems
  //       .map(item => 
  //           `${item.itemId}${item.quantity}${item.price.toFixed(2)}`
  //       )
  //       .join('');

  //   // Use customerProfileId if exists, otherwise empty string
  //   const customerProfileId = paymentData.customerProfileId || '';

  //   // Build the signature string in the exact order specified
  //   const signatureString = `${this.merchantCode}${paymentData.merchantRefNum}${customerProfileId}${paymentData.returnUrl}${itemsString}${this.securityKey}`;

  //   console.log('Pre-hash Signature String:', signatureString);

  //   return crypto
  //       .createHash('sha256')
  //       .update(signatureString)
  //       .digest('hex')
  //       .toUpperCase();
  // }

  // private buildChargeRequest(paymentData: PaymentData): any {
  //   // Calculate total amount
  //   const totalAmount = paymentData.chargeItems
  //     .reduce((total, item) => total + item.price * item.quantity, 0)
  //     .toFixed(2);

  //   // Construct charge request payload
  //   const chargeRequest = {
  //     merchantCode: this.merchantCode,
  //     merchantRefNum: paymentData.merchantRefNum,
  //     customerMobile: paymentData.customerMobile,
  //     customerEmail: paymentData.customerEmail,
  //     customerName: paymentData.customerName,
  //     customerProfileId: paymentData.customerProfileId || '',
  //     // paymentExpiry: paymentData.paymentExpiry,
  //     language: paymentData.language || 'en-gb',
  //     chargeItems: paymentData.chargeItems,
  //     returnUrl: paymentData.returnUrl,
  //     authCaptureModePayment: false,
  //     amount: totalAmount,
  //   };

  //   // Generate the signature for this request
  //   chargeRequest['signature'] = this.generateSignature(chargeRequest);

  //   return chargeRequest;
  // }




  /////////////////////////////////////////////////////

// private buildChargeRequest() {
//   const secureKey = 'your-secure-key'; // Replace with your actual secure key

//   // Parameters
//   const chargeRequest = {
//       merchantCode: '1tSa6uxz2nRbgY+b+cZGyA==',
//       merchantRefNum: '2312465464',
//       customerMobile: '01000000000',
//       customerEmail: 'test@example.com',
//       customerName: 'John Doe',
//       customerProfileId: '1212',
//       paymentExpiry: Date.now() + 24 * 60 * 60 * 1000, // Expire after 24 hours
//       language: 'en-gb',
//       chargeItems: [
//           {
//               itemId: 'item1',
//               description: 'Sample Product',
//               price: 50.00,
//               quantity: 2,
//               imageUrl: 'https://example.com/image1.jpg',
//           },
//           {
//               itemId: 'item2',
//               description: 'Another Product',
//               price: 75.25,
//               quantity: 3,
//               imageUrl: 'https://example.com/image2.jpg',
//           },
//       ],
//       returnUrl: 'https://example.com/return-url',
//       authCaptureModePayment: false,
//   };

//   // Signature Generation
//   const stringToSign = [
//       chargeRequest.merchantCode,
//       chargeRequest.merchantRefNum,
//       chargeRequest.customerProfileId || '',
//       chargeRequest.returnUrl,
//       chargeRequest.chargeItems
//           .sort((a, b) => a.itemId.localeCompare(b.itemId))
//           .map(item => `${item.itemId}${item.quantity}${item.price.toFixed(2)}`)
//           .join(''),
//       secureKey,
//   ].join('');

//   chargeRequest.signature = crypto
//       .createHash('sha256')
//       .update(stringToSign)
//       .digest('hex');

//   return chargeRequest;
// }

// async  sendChargeRequest(chargeRequest) {
//   const endpoint = 'https://atfawry.fawrystaging.com/fawrypay-api/api/payments/init'; // Staging URL
//   try {
//       const response = await axios.post(endpoint, chargeRequest, {
//           headers: { 'Content-Type': 'application/json' },
//       });
//       console.log('Redirect URL:', response.data.redirectUrl); // Redirect user to this URL
//   } catch (error) {
//       console.error('Error:', error.response ? error.response.data : error.message);
//   }
// }



//////////////////////////////////////////////////////////////////

async createChargeRequest(createChargeRequestDto: CreateChargeRequestDto): Promise<string> {

   // Set merchantCode from environment variable
   createChargeRequestDto.merchantCode = process.env.FAWRY_MERCHANT_CODE;

  // Generate a unique merchantRefNum
  createChargeRequestDto.merchantRefNum = `MRN${Date.now()}`; // Ensure it's unique

  // Set payment expiry to 24 hours from now
  createChargeRequestDto.paymentExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  // createChargeRequestDto.paymentExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes in milliseconds

  createChargeRequestDto.signature = this.generateSignature(createChargeRequestDto);
  
  try {
    const response = await axios.post('https://atfawry.fawrystaging.com/fawrypay-api/api/payments/init', createChargeRequestDto);
    // console.log('Fawry API Response:', response.data); // Log the response
    // console.log('Full Response:', response); // Log the full response object
    return response.data; // Ensure this is the correct property
  } catch (error) {
    console.error('Error initiating payment:', error.response?.data || error.message);
    throw new HttpException('Failed to initiate payment', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

generateSignature(chargeRequest: CreateChargeRequestDto): string {
  let signatureString = `${chargeRequest.merchantCode}${chargeRequest.merchantRefNum}${chargeRequest.customerProfileId || ''}${chargeRequest.returnUrl}`;
  chargeRequest.chargeItems.forEach(item => {
    signatureString += `${item.itemId}${item.quantity}${item.price.toFixed(2)}`;
  });
  signatureString += process.env.FAWRY_SECURITY_KEY;
  return crypto.createHash('sha256').update(signatureString).digest('hex');
}

// async handleCallback(fawryCallbackDto: FawryCallbackDto): Promise<void> {
//   const expectedSignature = this.generateCallbackSignature(fawryCallbackDto);
//   if (expectedSignature !== fawryCallbackDto.signature) {
//     throw new HttpException('Invalid callback signature', HttpStatus.BAD_REQUEST);
//   }
//   // await this.orderModel.findOneAndUpdate(
//   //   { merchantRefNum: fawryCallbackDto.merchantRefNumber },
//   //   fawryCallbackDto,
//   //   { upsert: true },
//   // );
// }

// async handlesubTrainingCallback(fawryCallbackDto: FawryCallbackDto): Promise<void> {
//   const expectedSignature = this.generateCallbackSignature(fawryCallbackDto);
//   if (expectedSignature !== fawryCallbackDto.signature) {
//       throw new HttpException('Invalid callback signature', HttpStatus.BAD_REQUEST);
//   }

//   // Process the payment result
//   if (fawryCallbackDto.orderStatus === 'Paid') {
//       // Update the sub-training status or record the transaction
//       const subTraining = await this.subTrainingModel.findById(fawryCallbackDto.merchantRefNumber);
//       if (subTraining) {
//           // Update the sub-training or enroll the student
//       }
//   }

//   await this.orderModel.findOneAndUpdate(
//       { merchantRefNum: fawryCallbackDto.merchantRefNumber },
//       fawryCallbackDto,
//       { upsert: true },
//   );
// }

async handleCallback(fawryCallbackDto: FawryCallbackDto): Promise<void> {
  try {
      // Log the received callback for debugging
      console.log('Received Fawry callback:', fawryCallbackDto);

      // Verify the signature
      const expectedSignature = this.generateCallbackSignature(fawryCallbackDto);
      console.log('Generated Signature:', expectedSignature);
      console.log('Received Signature:', fawryCallbackDto.messageSignature);

      if (expectedSignature !== fawryCallbackDto.messageSignature) {
          throw new HttpException('Invalid callback signature', HttpStatus.BAD_REQUEST);
      }

      // Check if the order already exists
      const existingOrder = await this.fawryModel.findOne({ merchantRefNum: fawryCallbackDto.merchantRefNumber });
      if (existingOrder) {
          console.log('Order already processed. Skipping...');
          return;
      }

      // Retrieve the charge item
      const chargeItem = fawryCallbackDto.orderItems[0];
      if (!chargeItem) {
          throw new BadRequestException('No charge items found in the callback');
      }
      const subTrainingId = chargeItem.itemCode; // Use `itemCode` instead of `itemId`

      // Find the sub-training
      // const subTraining = await this.subTrainingModel.findById(subTrainingId);
      // if (!subTraining) {
      //     throw new NotFoundException('Sub-training not found');
      // }

      // Handle order status
      if (fawryCallbackDto.orderStatus !== 'PAID') {
          console.log(`Order status is ${fawryCallbackDto.orderStatus}. No action taken.`);
          return;
      }

      // // Update the sub-training
      // subTraining.numberOfStudentsEnrolled += 1;
      // subTraining.AvailableSeats -= 1;

      try {
          // await subTraining.save();
          console.log('Sub-training updated successfully:', subTrainingId);
      } catch (error) {
          console.error('Failed to update sub-training:', error.message);
          throw new InternalServerErrorException('Failed to update sub-training');
      }

      // Save the callback data to the database using the Fawry entity
      const fawryOrder = new this.fawryModel({
          requestId: fawryCallbackDto.requestId,
          fawryRefNumber: fawryCallbackDto.fawryRefNumber,
          merchantRefNum: fawryCallbackDto.merchantRefNumber,
          customerName: fawryCallbackDto.customerName,
          customerMobile: fawryCallbackDto.customerMobile,
          customerMail: fawryCallbackDto.customerMail,
          customerMerchantId: fawryCallbackDto.customerMerchantId,
          paymentAmount: fawryCallbackDto.paymentAmount,
          orderAmount: fawryCallbackDto.orderAmount,
          fawryFees: fawryCallbackDto.fawryFees,
          shippingFees: fawryCallbackDto.shippingFees,
          orderStatus: fawryCallbackDto.orderStatus,
          paymentMethod: fawryCallbackDto.paymentMethod,
          paymentTime: fawryCallbackDto.paymentTime,
          authNumber: fawryCallbackDto.authNumber,
          paymentRefrenceNumber: fawryCallbackDto.paymentRefrenceNumber,
          orderExpiryDate: fawryCallbackDto.orderExpiryDate,
          orderItems: fawryCallbackDto.orderItems,
          failureErrorCode: fawryCallbackDto.failureErrorCode,
          failureReason: fawryCallbackDto.failureReason,
          messageSignature: fawryCallbackDto.messageSignature,
          threeDSInfo: fawryCallbackDto.threeDSInfo,
          invoiceInfo: fawryCallbackDto.invoiceInfo,
          installmentInterestAmount: fawryCallbackDto.installmentInterestAmount,
          installmentMonths: fawryCallbackDto.installmentMonths,
      });

      try {
          await fawryOrder.save();
          console.log('Fawry order saved successfully:', fawryOrder);
      } catch (error) {
          console.error('Failed to save Fawry order:', error.message);
          throw new InternalServerErrorException('Failed to save Fawry order');
      }
  } catch (error) {
      console.error('Error in handleCallback:', error.message || error);
      throw error; // Re-throw the error to be handled by the global exception filter
  }
}

generateCallbackSignature(callbackData: FawryCallbackDto): string {
  let signatureString = `${callbackData.fawryRefNumber}${callbackData.merchantRefNumber}${callbackData.paymentAmount.toFixed(2)}${callbackData.orderAmount.toFixed(2)}${callbackData.orderStatus}${callbackData.paymentMethod}${callbackData.fawryFees.toFixed(2)}${callbackData.customerMail}${callbackData.customerMobile}${process.env.FAWRY_SECURITY_KEY}`;
  return crypto.createHash('sha256').update(signatureString).digest('hex');
}

}

