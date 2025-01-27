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
import { v4 as uuidv4 } from 'uuid'; // Ensure you import uuidv4
import { subTrainingPurchase } from './entities/subtraining.purchase.entity';
import { NationalityI18nService } from 'src/nationality-i18n/nationality-i18n.service';

@Injectable()
export class SubtrainingService {
  constructor(
    @InjectModel(SubTrainingEntity.name) private readonly subTrainingModel: Model<SubTrainingEntity>,
    @InjectModel(SummerTraining.name) private readonly summerTrainingModel: Model<SummerTraining>,
    @InjectModel(Instructor.name) private readonly InstructorModel: Model<Instructor>,
    @InjectModel(FawryOrders.name) private readonly fawryModel: Model<FawryOrders>,
    @InjectModel(subTrainingPurchase.name) private readonly subTrainingPurchaseModel: Model<subTrainingPurchase>,

    private readonly cloudinaryService: CloudinaryService,
    private readonly fawryService: FawryService,
    private readonly NationalityI18nService: NationalityI18nService,

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
  validateNationality(nationality:string) {
    // const { nationality } = inputNationalityDto;
    const allNationalities = this.NationalityI18nService.getAllNationalities();

    // Check if the nationality exists in the list
    const foundNationality = allNationalities.find(n => n.nationality.toLowerCase() === nationality.toLowerCase());

    if (!foundNationality) {
      throw new NotFoundException(`Nationality "${nationality}" not found`);
    }

    return foundNationality; // Return the found nationality object
  }
  async purchaseSubTraining(
    id: string,
    purchaseDto: PurchaseSubTrainingDto,
    userId: string,
  ): Promise<string> {
    try {
      // Validate the nationality before proceeding
      this.validateNationality(purchaseDto.nationality);

      // Generate a unique merchantRefNum
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
        merchantCode: process.env.FAWRY_MERCHANT_CODE, // Ensure this is set in your environment
        merchantRefNum: merchantRefNum, // Use the generated unique reference
        customerMobile: purchaseDto.customerMobile,
        customerEmail: purchaseDto.email,
        customerName: `${purchaseDto.customerFirstName} ${purchaseDto.customerLastName}`,
        language: 'en-gb',
        chargeItems: [
          {
            itemId: subTraining._id.toString(),
            description: subTraining.name,
            price: amount,
            quantity: 1,
          },
        ],
        returnUrl: 'http://Planp-learning.com', // Your actual return URL
        paymentExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      };
  
      // Call Fawry service to create charge request
      const redirectUrl = await this.fawryService.createChargeRequest(createChargeRequestDto);
  
      // Log the redirect URL for debugging
      console.log('Redirect URL:', redirectUrl);
  
      // Ensure redirectUrl is a string
      if (typeof redirectUrl !== 'string') {
        throw new InternalServerErrorException('Invalid redirect URL returned from Fawry service');
      }
  
      // Save the purchase data in the database
      const purchaseData = {
        summerTrainingId: new Types.ObjectId(purchaseDto.summerTrainingId),
        subTrainingId: new Types.ObjectId(purchaseDto.subTrainingId),
        university: purchaseDto.university,
        faculty: purchaseDto.faculty,
        level: purchaseDto.level,
        email: purchaseDto.email,
        firstName: purchaseDto.customerFirstName,
        lastName: purchaseDto.customerLastName,
        nationality: purchaseDto.nationality,
        phoneNumber: purchaseDto.customerMobile,
        paymentStatus: 'PENDING',
        paymentReference: merchantRefNum,
      };
  
      // Save the purchase data to the database (assuming you have a model for purchases)
      await this.subTrainingPurchaseModel.create(purchaseData);
  
      // Return the redirect URL
      return redirectUrl;
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof InternalServerErrorException) {
        throw new InternalServerErrorException('An error occurred while processing the payment request');
      } else {
        console.error('Unexpected error:', error);
        throw new InternalServerErrorException('An unexpected error occurred');
      }
    }
  }
  
  private generateMerchantRefNum(userId: string): string {
    const uuid = uuidv4(); // Generate a UUID
    return `${userId}-${uuid}`; // Combine userId and UUID
  }


  async getAllPurchases(page: number = 1, limit: number = 10): Promise<any> {
    try {
      // Ensure page and limit are positive integers
      page = Math.max(1, page);
      limit = Math.max(1, limit);
  
      const skip = (page - 1) * limit;
  
      // Perform data fetching and total count in parallel
      const [purchases, total] = await Promise.all([
        this.subTrainingPurchaseModel.find().skip(skip).limit(limit).exec(),
        this.subTrainingPurchaseModel.countDocuments().exec(),
      ]);
  
      if (!purchases || purchases.length === 0) {
        throw new NotFoundException('No purchase records found');
      }
  
      // Return a structured response
      return {
        data: purchases,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching purchase data:', error.message || error);
      throw new InternalServerErrorException('Failed to fetch purchase data');
    }
  }
}


