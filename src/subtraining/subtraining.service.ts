import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { CreateSubTrainingDto } from './dto/create.subtraining.dto';
import { SubTrainingEntity } from './entities/subtraining.entity';
import { SummerTraining } from '../summertraining/entities/summertraining.entity';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Instructor } from '../instructor/entities/instructor.entity';
import { SubTrainingsPaginateDto } from './dto/get.sub.trainings.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { AgendaDto } from 'src/events/dto/agenda.dto';
import { TopicDto } from './dto/add.topic.dto';
import { PurchaseSubTrainingDto } from './dto/purchase-subtraining.dto';
import { FawryService } from '../fawry/fawry.service';
import { FawryCallbackDto } from 'src/fawry/dto/fawry-callback.dto';
import { FawryOrders } from '../fawry/entities/fawry.entity';
import { PurchaseType } from 'src/fawry/PurchaseTypeEnum';
import { v4 as uuidv4 } from 'uuid'; // Ensure you import uuidv4

@Injectable()
export class SubtrainingService {
  constructor(
    @InjectModel(SubTrainingEntity.name) private readonly subTrainingModel: Model<SubTrainingEntity>,
    @InjectModel(SummerTraining.name) private readonly summerTrainingModel: Model<SummerTraining>,
    @InjectModel(Instructor.name) private readonly InstructorModel: Model<Instructor>,
    @InjectModel(FawryOrders.name) private readonly fawryModel: Model<FawryOrders>,

    private readonly cloudinaryService: CloudinaryService,
    private readonly fawryService: FawryService,

  ) {}
  async create(createSubTrainingDto: CreateSubTrainingDto, image: Express.Multer.File): Promise<SubTrainingEntity> {
    // Upload the image and get the URL
    const foldername = 'sub-trainings';
    const imageUrl = await this.cloudinaryService.uploadImage(image, foldername);
    // Check if the provided summerTraining ID exists
    const summerTraining = await this.summerTrainingModel.findById(createSubTrainingDto.summerTraining);
    if (!summerTraining) {
      throw new NotFoundException('Summer training not found');
    }
  
    // Check if the provided instructor ID exists
    const instructor = await this.InstructorModel.findById(createSubTrainingDto.instructor);
    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }
  
    // Create the sub-training entity
    const createdSubTraining = new this.subTrainingModel({
      ...createSubTrainingDto,
      image: imageUrl.url,
    });
  
    // Save the sub-training entity
    const savedSubTraining = await createdSubTraining.save();
  
    // Add to the summer training's sub-trainings array
    await this.summerTrainingModel.updateOne(
      { _id: createSubTrainingDto.summerTraining },
      { $push: { subTrainings: savedSubTraining }, $inc: { subTrainingsCount: 1 } }
    );
  
    // Add to the instructor's sub-trainings array
    await this.InstructorModel.updateOne(
      { _id: createSubTrainingDto.instructor },
      { $push: { subTrainings: savedSubTraining } }
    );
    console.log(savedSubTraining)
    return savedSubTraining;
  }
  

  async getAllSubTrainingsForSummerTraining(summerTrainingId: string, page: number, limit: number): Promise<{ data: SubTrainingEntity[], total: number }> {
    // Check if the summer training ID is valid
    if (!Types.ObjectId.isValid(summerTrainingId)) {
        throw new NotFoundException('Invalid summer training ID');
    }

    // Fetch total count of sub-trainings for the specific summer training ID
    const total = await this.subTrainingModel.countDocuments({ summerTraining: new Types.ObjectId(summerTrainingId) });

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch paginated sub-trainings
    const subTrainings = await this.subTrainingModel
        .find({ summerTraining: new Types.ObjectId(summerTrainingId) })
        .skip(skip)
        .limit(limit)
        .exec();

    // If no sub-trainings found, log the message
    if (subTrainings.length === 0) {
        console.log(`No sub-trainings found for summer training ID: ${summerTrainingId}`);
    }

    return { data: subTrainings, total };
  }


  async getSubTrainingById(id: string): Promise<SubTrainingEntity> {
   
    // Find the sub-training by ID
    const subTraining = await this.subTrainingModel.findById(id).exec();

    // If not found, throw a NotFoundException
    if (!subTraining) {
      throw new NotFoundException('Sub-training not found');
    }

    return subTraining;
  }


  async update(id: string, updateSubTrainingDto: Partial<CreateSubTrainingDto>, image?: Express.Multer.File): Promise<SubTrainingEntity> {
    // Check if the sub-training exists
    const subTraining = await this.subTrainingModel.findById(id);
    if (!subTraining) {
      throw new NotFoundException('Sub-training not found');
    }

    // If an image is provided, upload it and update the URL
    let imageUrl: string | undefined;
    if (image) {
      const foldername = 'sub-trainings';
      const uploadedImage = await this.cloudinaryService.uploadImage(image, foldername);
      imageUrl = uploadedImage.url;
    }

    // Update the sub-training entity with new values
    const updatedSubTraining = await this.subTrainingModel.findByIdAndUpdate(
      id,
      { ...updateSubTrainingDto, ...(imageUrl ? { image: imageUrl } : {}) },
      { new: true },
    );

    if (!updatedSubTraining) {
      throw new NotFoundException('Sub-training not found');
    }

    return updatedSubTraining;
  }
  async deleteSubTraining(id: string): Promise<void> {
    const subTraining = await this.subTrainingModel.findById(id).exec();
    if (!subTraining) {
      throw new NotFoundException(`SubTrainingEntity with id ${id} not found`);
    }
    await this.subTrainingModel.findByIdAndDelete(id).exec();
  }

  async addOffer(subTrainingId: string, createOfferDto: CreateOfferDto): Promise<SubTrainingEntity> {
    try {
      // Find the sub-training
      const subTraining = await this.subTrainingModel.findById(subTrainingId);
      if (!subTraining) {
        throw new NotFoundException('Sub-training not found');
      }

      // Validate dates
      const now = new Date();
      const startDate = new Date(createOfferDto.offerStartDate);
      const endDate = new Date(createOfferDto.offerEndDate);

      if (startDate > endDate) {
        throw new BadRequestException('Offer end date must be after start date');
      }

      if (endDate < now) {
        throw new BadRequestException('Offer end date must be in the future');
      }

      // Validate offer price
      if (createOfferDto.offerPrice >= subTraining.price) {
        throw new BadRequestException('Offer price must be less than original price');
      }

      // Calculate discount percentage if not provided
      if (!createOfferDto.discountPercentage) {
        createOfferDto.discountPercentage = 
          ((subTraining.price - createOfferDto.offerPrice) / subTraining.price) * 100;
      }

      // Update the sub-training with offer details
      const updatedSubTraining = await this.subTrainingModel.findByIdAndUpdate(
        subTrainingId,
        {
          hasOffer: true,
          offerPrice: createOfferDto.offerPrice,
          offerStartDate: startDate,
          offerEndDate: endDate,
          offerDescription: createOfferDto.offerDescription,
          discountPercentage: createOfferDto.discountPercentage,
        },
        { new: true }
      );

      return updatedSubTraining;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add offer to sub-training');
    }
  }

  async removeOffer(subTrainingId: string): Promise<SubTrainingEntity> {
    const subTraining = await this.subTrainingModel.findById(subTrainingId);
    if (!subTraining) {
      throw new NotFoundException('Sub-training not found');
    }

    return await this.subTrainingModel.findByIdAndUpdate(
      subTrainingId,
      {
        hasOffer: false,
        $unset: {
          offerPrice: "",
          offerStartDate: "",
          offerEndDate: "",
          offerDescription: "",
          discountPercentage: ""
        }
      },
      { new: true }
    );
  }


  
  async addTopicToEvent(
    subtrainingId: string,
    TopicDto: TopicDto,
  ): Promise<any> {
    try {
      const subtraining = await this.subTrainingModel.findById(subtrainingId).exec();
      if (!subtraining) {
        throw new NotFoundException(`subtraining with ID ${subtrainingId} not found`);
      }

      // Check for duplicate agenda title
      const existingTopicTitles = new Set(subtraining.topic.map((a) => a.title));
      if (existingTopicTitles.has(TopicDto.title)) {
        throw new BadRequestException(
          `topic item with title "${TopicDto.title}" already exists in the sub training.`,
        );
      }

      // Create a new Agenda instance
      const topicItem = {
        _id: new Types.ObjectId(),
        title: TopicDto.title,
        
      };

      // Add the new agenda item to the existing agenda array
      subtraining.topic.push(topicItem);

      // Save the updated event
      const updatedSubtraining = await subtraining.save();
      console.log('topic item added successfully:', updatedSubtraining);
      return updatedSubtraining;
    } catch (error) {
      console.error('Error adding topic to sub training:', error.message || error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add topic to sub training');
    }
  }

  async removeTopicFromSubTraining(subTrainingId: string, topicId: string): Promise<any> {
    try {
      const updatedSubTraining = await this.subTrainingModel.findByIdAndUpdate(
        subTrainingId,
        {
          $pull: {
            topic: { _id: new Types.ObjectId(topicId) }
          }
        },
        { new: true }
      ).exec();

      if (!updatedSubTraining) {
        throw new NotFoundException(`topic with ID ${subTrainingId} not found`);
      }

      return updatedSubTraining;
    } catch (error) {
      console.error('Error removing topic from sub training:', error.message || error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove topic from sub training');
    }
  }

  
  async getTopicById(subTrainingId: string, topicId: string): Promise<any> {
    try {
      const subTraining = await this.subTrainingModel.findById(subTrainingId).exec();
      if (!subTraining) {
        throw new NotFoundException(`topic with ID ${subTrainingId} not found`);
      }

      const topicItem = subTraining.topic.find(
        (a) => a._id.toString() === topicId
      );

      if (!topicItem) {
        throw new NotFoundException(`topic item with ID ${topicId} not found in sub training`);
      }

      return topicItem;
    } catch (error) {
      console.error('Error fetching topic item:', error.message || error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch topic item');
    }
  }

  async getTopicsBySubTrainingId(subTrainingId: string): Promise<TopicDto[]> {
    // Find the sub-training by ID
    const subTraining = await this.subTrainingModel.findById(subTrainingId).exec();
    
    // If not found, throw a NotFoundException
    if (!subTraining) {
        throw new NotFoundException(`Sub-training with ID ${subTrainingId} not found`);
    }

    // Return the topics from the sub-training
    return subTraining.topic; // Assuming 'topic' is an array of TopicDto
  }


  async purchaseSubTraining(id: string, purchaseDto: PurchaseSubTrainingDto,userId:String): Promise<string> {
    try {
        // // Log the incoming purchaseDto for debugging
        // console.log('Purchase DTO:', purchaseDto);
        // console.log('Sub-training ID:', id); // Log the parsed subTrainingId

         console.log(userId)
         const merchantRefNum = this.generateMerchantRefNum(userId.toString());

        // Retrieve the sub-training
        const subTraining = await this.subTrainingModel.findById(id).exec();
        if (!subTraining) {
            throw new NotFoundException(`Sub-training with ID ${id} not found`);
        }

        // Check if there are available seats
        if (subTraining.AvailableSeats <= 0) {
            throw new BadRequestException('No seats available for this sub-training');
        }

        // Determine the price based on offer
        const amount = subTraining.price;

        // Create the charge request DTO
        const createChargeRequestDto = {
            merchantCode: '', // Ensure this is set in your environment
            merchantRefNum: merchantRefNum, // Ensure this is a primitive string
            customerMobile: purchaseDto.customerMobile,
            customerEmail: purchaseDto.customerEmail,
            customerName: purchaseDto.customerName,
            language: 'en-gb',
            chargeItems: [
                {
                    itemId: subTraining._id.toString(),
                    description: subTraining.name,
                    price: amount,
                    quantity: 1,
                },
            ],
            returnUrl: 'https://www.google.com/', // Your actual return URL
            paymentExpiry: 0, // 24 hours in milliseconds
            purchaseType: PurchaseType.SUB_TRAINING,
        };

        // Call Fawry service to create charge request
        const redirectUrl = await this.fawryService.createChargeRequest(createChargeRequestDto);

        // Log the redirect URL for debugging
        console.log('Redirect URL:', redirectUrl);

        // Ensure redirectUrl is a string
        if (typeof redirectUrl !== 'string') { 
            throw new InternalServerErrorException('Invalid redirect URL returned from Fawry service');
        }

        // Return the redirect URL
        return redirectUrl; // Return the URL directly

    } catch (error) {
        // Handle specific errors
        console.log(error)
        if (error instanceof NotFoundException) {
            throw new NotFoundException(error.message);
        } else if (error instanceof BadRequestException) {
            throw new BadRequestException(error.message);
        } else if (error instanceof InternalServerErrorException) {
            throw new InternalServerErrorException('An error occurred while processing the payment request');
        } else {
            // Log unexpected errors
            console.error('Unexpected error:', error);
            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }
  }
  
  private generateMerchantRefNum(userId: string): string {
    const uuid = uuidv4(); // Generate a UUID
    return `${userId}-${uuid}`; // Combine userId and UUID
  }
// async handleCallback(fawryCallbackDto: FawryCallbackDto): Promise<void> {
//   try {
//       // Log the received callback for debugging
//       console.log('Received Fawry callback:', fawryCallbackDto);

//       // Verify the signature
//       const expectedSignature = this.fawryService.generateCallbackSignature(fawryCallbackDto);
//       console.log('Generated Signature:', expectedSignature);
//       console.log('Received Signature:', fawryCallbackDto.messageSignature);

//       if (expectedSignature !== fawryCallbackDto.messageSignature) {
//           throw new HttpException('Invalid callback signature', HttpStatus.BAD_REQUEST);
//       }

//       // Check if the order already exists
//       const existingOrder = await this.fawryModel.findOne({ merchantRefNum: fawryCallbackDto.merchantRefNumber });
//       if (existingOrder) {
//           console.log('Order already processed. Skipping...');
//           return;
//       }

//       // Retrieve the charge item
//       const chargeItem = fawryCallbackDto.orderItems[0];
//       if (!chargeItem) {
//           throw new BadRequestException('No charge items found in the callback');
//       }
//       const subTrainingId = chargeItem.itemCode; // Use `itemCode` instead of `itemId`

//       // Find the sub-training
//       const subTraining = await this.subTrainingModel.findById(subTrainingId);
//       if (!subTraining) {
//           throw new NotFoundException('Sub-training not found');
//       }

//       // Handle order status
//       if (fawryCallbackDto.orderStatus !== 'PAID') {
//           console.log(`Order status is ${fawryCallbackDto.orderStatus}. No action taken.`);
//           return;
//       }

//       // Update the sub-training
//       subTraining.numberOfStudentsEnrolled += 1;
//       subTraining.AvailableSeats -= 1;

//       try {
//           await subTraining.save();
//           console.log('Sub-training updated successfully:', subTrainingId);
//       } catch (error) {
//           console.error('Failed to update sub-training:', error.message);
//           throw new InternalServerErrorException('Failed to update sub-training');
//       }

//       // Save the callback data to the database using the Fawry entity
//       const fawryOrder = new this.fawryModel({
//           requestId: fawryCallbackDto.requestId,
//           fawryRefNumber: fawryCallbackDto.fawryRefNumber,
//           merchantRefNum: fawryCallbackDto.merchantRefNumber,
//           customerName: fawryCallbackDto.customerName,
//           customerMobile: fawryCallbackDto.customerMobile,
//           customerMail: fawryCallbackDto.customerMail,
//           customerMerchantId: fawryCallbackDto.customerMerchantId,
//           paymentAmount: fawryCallbackDto.paymentAmount,
//           orderAmount: fawryCallbackDto.orderAmount,
//           fawryFees: fawryCallbackDto.fawryFees,
//           shippingFees: fawryCallbackDto.shippingFees,
//           orderStatus: fawryCallbackDto.orderStatus,
//           paymentMethod: fawryCallbackDto.paymentMethod,
//           paymentTime: fawryCallbackDto.paymentTime,
//           authNumber: fawryCallbackDto.authNumber,
//           paymentRefrenceNumber: fawryCallbackDto.paymentRefrenceNumber,
//           orderExpiryDate: fawryCallbackDto.orderExpiryDate,
//           orderItems: fawryCallbackDto.orderItems,
//           failureErrorCode: fawryCallbackDto.failureErrorCode,
//           failureReason: fawryCallbackDto.failureReason,
//           messageSignature: fawryCallbackDto.messageSignature,
//           threeDSInfo: fawryCallbackDto.threeDSInfo,
//           invoiceInfo: fawryCallbackDto.invoiceInfo,
//           installmentInterestAmount: fawryCallbackDto.installmentInterestAmount,
//           installmentMonths: fawryCallbackDto.installmentMonths,
//       });

//       try {
//           await fawryOrder.save();
//           console.log('Fawry order saved successfully:', fawryOrder);
//       } catch (error) {
//           console.error('Failed to save Fawry order:', error.message);
//           throw new InternalServerErrorException('Failed to save Fawry order');
//       }
//   } catch (error) {
//       console.error('Error in handleCallback:', error.message || error);
//       throw error; // Re-throw the error to be handled by the global exception filter
//   }
// }
}


