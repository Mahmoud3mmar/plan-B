import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSummerTrainingDto } from './dto/create.summertraining.dto';
import { SummerTraining } from './entities/summertraining.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Instructor } from '../instructor/entities/instructor.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GetSummerTrainingDto } from './dto/get.summer.training.dto';
import { UpdateSummerTrainingDto } from './dto/update.summertraining.dto';
import { SubTrainingEntity } from 'src/subtraining/entities/subtraining.entity';

@Injectable()
export class SummertrainingService {
  constructor(
    @InjectModel(SummerTraining.name) private readonly summerTrainingModel: Model<SummerTraining>,
    @InjectModel(SubTrainingEntity.name) private readonly subTrainingModel: Model<SubTrainingEntity>,


    private readonly cloudinaryService: CloudinaryService,

  ) {}

  // Create summer training
  async create(
    createSummerTrainingDto: CreateSummerTrainingDto,
    file: Express.Multer.File, // Image file
  ): Promise<SummerTraining> {
    // Check if the file exists
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    // Upload the file to Cloudinary
    const foldername='SummerTraining'
    const uploadResult = await this.cloudinaryService.uploadImage(file,foldername);
    if (!uploadResult || !uploadResult.secure_url) {
      throw new BadRequestException('Image upload failed');
    }


    // Create a new SummerTraining document
    const newSummerTraining = new this.summerTrainingModel({
      ...createSummerTrainingDto,
      image: uploadResult.secure_url, // Use Cloudinary image URL
    });

    // Save the new summer training in the database
    return await newSummerTraining.save();
  }


  async getAllSummerTraining(
    query: GetSummerTrainingDto,
  ): Promise<any> {
    const {
      level,
      type,
      page = '1',
      limit = '10',
    } = query;

    // Calculate pagination parameters
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Build the filter query
    const filter: any = {};
    if (level) {
      filter.level = level;
    }
    if (type) {
      filter.type = type;
    }

    // Fetch paginated and filtered results
    const [results, total] = await Promise.all([
      this.summerTrainingModel.find(filter)
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.summerTrainingModel.countDocuments(filter).exec(),
    ]);

    return {
      data: results,
      total,
      totalPages: Math.ceil(total / pageSize),
      page: pageNumber,
      limit: pageSize,
    };
  }


  async getSummerTrainingById(id: string): Promise<SummerTraining> {
    const training = await this.summerTrainingModel.findById(id).exec();
    if (!training) {
      throw new NotFoundException(`Summer training with ID ${id} not found`);
    }
    return training;
  }
  



    async updateSummerTraining(
      id: string,
      updateDto: UpdateSummerTrainingDto,
      image?: Express.Multer.File, // Image file is optional
    ): Promise<SummerTraining> {
      try {
        // Find the existing summer training record
        const existingTraining = await this.summerTrainingModel.findById(id).exec();
        if (!existingTraining) {
          throw new NotFoundException(`Summer training with ID ${id} not found`);
        }
  
        // Check if the file exists and upload it to Cloudinary if provided
        if (image) {
          const folderName = 'SummerTraining';
          const uploadResult = await this.cloudinaryService.uploadImage(image, folderName);
          if (!uploadResult || !uploadResult.secure_url) {
            throw new BadRequestException('Image upload failed');
          }
          // Update the image URL in the update object
          updateDto.image = uploadResult.secure_url; // Add the uploaded image URL to the updateDto
        }
  
        // Update the summer training document with the new data
        const updatedTraining = await this.summerTrainingModel.findByIdAndUpdate(
          id,
          updateDto,
          {
            new: true, // Return the updated document
            runValidators: true, // Run validation on update
          }
        ).exec();
  
        return updatedTraining;
      } catch (error) {
        // Log the error if necessary
        throw new Error(`Failed to update summer training: ${error.message}`);
      }
    }
  
  



  async deleteSummerTraining(id: string): Promise<void> {
    // Find the SummerTraining entity
    const summerTraining = await this.summerTrainingModel.findById(id).exec();
    if (!summerTraining) {
      throw new NotFoundException(`SummerTraining with id ${id} not found`);
    }

    // Delete related sub-training entities
    if (summerTraining.subTrainings.length > 0) {
      await this.subTrainingModel.deleteMany({
        _id: { $in: summerTraining.subTrainings },
      }).exec();
    }

    // Finally, delete the SummerTraining entity
    await this.summerTrainingModel.findByIdAndDelete(id).exec();
  }
}
