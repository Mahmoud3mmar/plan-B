import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { CreateChargeRequestDto } from './dto/create-fawry.dto';
import { FawryCallbackDto } from './dto/fawry-callback.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FawryOrders } from './entities/fawry.entity';
import { SubTrainingEntity } from 'src/subtraining/entities/subtraining.entity';
import { StudentService } from 'src/student/student.service';
import { Events } from 'src/events/entities/event.entity';
import { Course } from 'src/course/entities/course.entity';

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
    @InjectModel(SubTrainingEntity.name) private readonly subTrainingModel: Model<SubTrainingEntity>,
    @InjectModel(Events.name) private readonly eventsModel: Model<Events>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,

    private readonly studentService: StudentService, // Inject StudentService here


    
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

  

async createChargeRequest(createChargeRequestDto: CreateChargeRequestDto): Promise<string> {

   // Set merchantCode from environment variable
   createChargeRequestDto.merchantCode = process.env.FAWRY_MERCHANT_CODE;

  // // Generate a unique merchantRefNum
  // createChargeRequestDto.merchantRefNum = `MRN${Date.now()}`; // Ensure it's unique

  // Set payment expiry to 24 hours from now
  createChargeRequestDto.paymentExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  // createChargeRequestDto.paymentExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes in milliseconds

  createChargeRequestDto.signature = this.generateSignature(createChargeRequestDto);
  
  const fawryPaymentUrl = process.env.FAWRY_PAYMENT_URL; // Get the payment URL from environment variables
  try {
    const response = await axios.post(fawryPaymentUrl, createChargeRequestDto);
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
//   try {
    
//     // Log the received callback for debugging
//     console.log('Received Fawry callback:', fawryCallbackDto);

//     // Verify the signature
//     // const expectedSignature = this.generateCallbackSignature(fawryCallbackDto);
//     // console.log('Generated Signature:', expectedSignature);
//     // console.log('Received Signature:', fawryCallbackDto.messageSignature);

//     // if (expectedSignature !== fawryCallbackDto.messageSignature) {
//     //   throw new HttpException('Invalid callback signature', HttpStatus.BAD_REQUEST);
//     // }

//     // Check if the order already exists
//     const existingOrder = await this.fawryModel.findOne({ merchantRefNum: fawryCallbackDto.merchantRefNumber });
//     if (existingOrder) {
//       console.log('Order already processed. Skipping...');
//       return;
//     }

//     // Retrieve the charge item
//     const chargeItem = fawryCallbackDto.orderItems[0];
//     if (!chargeItem) {
//       throw new BadRequestException('No charge items found in the callback');
//     }
//     const subTrainingId = chargeItem.itemCode; // Use `itemCode` instead of `itemId`

//       // Find the sub-training
//       const subTraining = await this.subTrainingModel.findById(subTrainingId);
//       if (!subTraining) {
//         throw new NotFoundException('Sub-training not found');
//       }

//     // Handle order status
//     if (fawryCallbackDto.orderStatus !== 'PAID') {
//       console.log(`Order status is ${fawryCallbackDto.orderStatus}. No action taken.`);
//       return;
//     }

//     // Update the sub-training
//     subTraining.numberOfStudentsEnrolled += 1;
//     subTraining.AvailableSeats -= 1;

//     try {
//       await subTraining.save();
//       console.log('Sub-training updated successfully:', subTrainingId);
//     } catch (error) {
//       console.error('Failed to update sub-training:', error.message);
//       throw new InternalServerErrorException('Failed to update sub-training');
//     }

    
//     // Save the callback data to the database using the Fawry entity
//     const fawryOrder = new this.fawryModel({
//       requestId: fawryCallbackDto.requestId,
//       fawryRefNumber: fawryCallbackDto.fawryRefNumber,
//       merchantRefNum: fawryCallbackDto.merchantRefNumber,
//       customerName: fawryCallbackDto.customerName,
//       customerMobile: fawryCallbackDto.customerMobile,
//       customerMail: fawryCallbackDto.customerMail,
//       customerMerchantId: fawryCallbackDto.customerMerchantId,
//       paymentAmount: fawryCallbackDto.paymentAmount,
//       orderAmount: fawryCallbackDto.orderAmount,
//       fawryFees: fawryCallbackDto.fawryFees,
//       shippingFees: fawryCallbackDto.shippingFees,
//       orderStatus: fawryCallbackDto.orderStatus,
//       paymentMethod: fawryCallbackDto.paymentMethod,
//       paymentTime: fawryCallbackDto.paymentTime,
//       authNumber: fawryCallbackDto.authNumber,
//       paymentRefrenceNumber: fawryCallbackDto.paymentRefrenceNumber,
//       orderExpiryDate: fawryCallbackDto.orderExpiryDate,
//       orderItems: fawryCallbackDto.orderItems,
//       failureErrorCode: fawryCallbackDto.failureErrorCode,
//       failureReason: fawryCallbackDto.failureReason,
//       messageSignature: fawryCallbackDto.messageSignature,
//       invoiceInfo: fawryCallbackDto.invoiceInfo,
//       installmentInterestAmount: fawryCallbackDto.installmentInterestAmount,
//       installmentMonths: fawryCallbackDto.installmentMonths,

//     });

//     try {
//       await fawryOrder.save();
//       console.log('Fawry order saved successfully:', fawryOrder);
//     } catch (error) {
//       console.error('Failed to save Fawry order:', error.message);
//       throw new InternalServerErrorException('Failed to save Fawry order');
//     }
//   } catch (error) {
//     console.error('Error in handleCallback:', error.message || error);
//     throw error; // Re-throw the error to be handled by the global exception filter
//   }
// }
async handleCallback(fawryCallbackDto: FawryCallbackDto): Promise<void> {
  try {
    // Log the received callback for debugging
    console.log('Received Fawry callback:', fawryCallbackDto);

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

    const itemId = chargeItem.itemCode; // Use `itemCode` instead of `itemId`
    const studentId = fawryCallbackDto.merchantRefNumber.split('-')[0]; // Extract userId from merchantRefNum

    // Handle order status
    if (fawryCallbackDto.orderStatus !== 'PAID') {
      console.log(`Order status is ${fawryCallbackDto.orderStatus}. No action taken.`);
      return;
    }

    // Determine the purchase type based on itemId
    const purchaseType = await this.determinePurchaseType(itemId);

    switch (purchaseType) {
      case 'SUB_TRAINING':
        await this.handleSubTrainingPurchase(itemId, studentId);
        break;
      case 'COURSE':
        await this.handleCoursePurchase(itemId, studentId);
        break;
      case 'EVENT':
        await this.handleEventPurchase(itemId, studentId);
        break;
        
      default:
        throw new BadRequestException('Invalid purchase type');
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

// Helper method to determine the purchase type
private async determinePurchaseType(itemId: string): Promise<string> {
  // Check if the itemId corresponds to a sub-training
  const subTraining = await this.subTrainingModel.findById(itemId).exec();
  if (subTraining) {
    return 'SUB_TRAINING';
  }

  // Check if the itemId corresponds to an event
  const event = await this.eventsModel.findById(itemId).exec();
  if (event) {
    return 'EVENT';
  }

  // Check if the itemId corresponds to a course (if applicable)
  const course = await this.courseModel.findById(itemId).exec();
  if (course) {
    return 'COURSE';
  }

  throw new BadRequestException('Invalid item ID: not found in SubTraining, Event, or Course'); // Throw an error if needed
}

/* -------------------------------------------------------------------------- */
/*                               HELPER METHODS                               */
/* -------------------------------------------------------------------------- */

async handleSubTrainingPurchase(subTrainingId: string, studentId: string): Promise<void> {
  const subTraining = await this.subTrainingModel.findById(subTrainingId);
  if (!subTraining) {
    throw new NotFoundException('Sub-training not found');
  }

  // Update sub-training enrollment
  subTraining.numberOfStudentsEnrolled += 1;
  subTraining.AvailableSeats -= 1;
  await subTraining.save();

  // Enroll the student in the sub-training
  await this.studentService.enrollInSubTraining(studentId, subTrainingId);
}

async handleCoursePurchase(courseId: string, studentId: string): Promise<void> {
  const course = await this.courseModel.findById(courseId);
  if (!course) {
    throw new NotFoundException('Course not found');
  }

  // Update course enrollment
  course.studentsEnrolled += 1;
  await course.save();

  // Enroll the student in the course
  await this.studentService.enrollInCourse(studentId, courseId);
}

async handleEventPurchase(eventId: string, studentId: string): Promise<void> {
  const event = await this.eventsModel.findById(eventId);
  if (!event) {
    throw new NotFoundException('Event not found');
  }

  // Update event enrollment
  event.enrolledStudents.push(studentId);
  await event.save();

  // Enroll the student in the event
  await this.studentService.enrollInEvent(studentId, eventId);
}

}

