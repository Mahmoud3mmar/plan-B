import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateSubTrainingDto } from './dto/create.subtraining.dto';
import { SubTrainingEntity } from './entities/subtraining.entity';
import { SummerTraining } from '../summertraining/entities/summertraining.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Instructor } from '../instructor/entities/instructor.entity';
import { SubTrainingsPaginateDto } from './dto/get.sub.trainings.dto';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class SubtrainingService {
  constructor(
    @InjectModel(SubTrainingEntity.name) private readonly subTrainingModel: Model<SubTrainingEntity>,
    @InjectModel(SummerTraining.name) private readonly summerTrainingModel: Model<SummerTraining>,
    @InjectModel(Instructor.name) private readonly InstructorModel: Model<Instructor>,

    private readonly cloudinaryService: CloudinaryService,

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
      { $push: { subTrainings: savedSubTraining } }
    );
  
    // Add to the instructor's sub-trainings array
    await this.InstructorModel.updateOne(
      { _id: createSubTrainingDto.instructor },
      { $push: { subTrainings: savedSubTraining  } }
    );
    console.log(savedSubTraining)
    return savedSubTraining;
  }
  

  async getAllSubTrainings(paginateDto: SubTrainingsPaginateDto): Promise<{ data: SubTrainingEntity[], total: number }> {
    const { page, limit, summerTrainingId } = paginateDto;

   
    // Check if the summer training exists
    const summerTrainingExists = await this.summerTrainingModel.exists({ _id: summerTrainingId });
    if (!summerTrainingExists) {
      throw new NotFoundException('SummerTraining with the provided ID does not exist');
    }

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch the total number of documents for the specific summer training
    const total = await this.subTrainingModel.countDocuments({ summerTraining: summerTrainingId });

    // Fetch the paginated data
    const data = await this.subTrainingModel
      .find({ summerTraining: summerTrainingId })
      .skip(skip)
      .limit(limit)
      .exec();

    return { data, total };
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
}

