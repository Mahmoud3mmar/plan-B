import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
// import { CreateInstructorDto } from './dto/create.instructor.dto';
import { Instructor } from './entities/instructor.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateInstructorDto } from './dto/update.instructor.dto';
import { User } from '../user/entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class InstructorService {
  constructor(@InjectModel(Instructor.name) private instructorModel: Model<Instructor>,

  @InjectModel(User.name) private UserModel: Model<User>,
  private readonly CloudinaryService: CloudinaryService,

) {}

  // async create(createInstructorDto: CreateInstructorDto): Promise<Instructor> {
  //   const instructor = new this.instructorModel(createInstructorDto);
  //   return await instructor.save();
  // }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Instructor[], total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.instructorModel.find().skip(skip).limit(limit).exec(),
      this.instructorModel.countDocuments().exec(),
    ]);
    return { data, total };
  }

  async findOne(id: string): Promise<Instructor> {
    const instructor = await this.instructorModel.findById(id).exec();
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }
    return instructor;
  }
  async updateInstructor(
    userId: string,
    updateInstructorDto: UpdateInstructorDto,
  ): Promise<Instructor> {
    // Find the instructor by ID
    const instructor = await this.instructorModel.findById(userId).exec();
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${userId} not found`);
    }

    // Update instructor details
    // Merge incoming data with existing data
    const updatedInstructor = Object.assign(instructor, updateInstructorDto);

    // Save the updated instructor
    await updatedInstructor.save();
    
    return updatedInstructor;
  }


  // async uploadProfileImage(userId: string, file: Express.Multer.File): Promise<Instructor> {
  //   try {
  //     const instructor = await this.instructorModel.findById(userId).exec();
  //     if (!instructor) {
  //       throw new NotFoundException(`Instructor with ID ${userId} not found.`);
  //     }

  //     const uploadResult = await this.CloudinaryService.uploadImage(file, 'profile-images');
  //     if (!uploadResult || !uploadResult.secure_url) {
  //       throw new InternalServerErrorException('Failed to upload image to Cloudinary.');
  //     }

  //     instructor.profileImage = uploadResult.secure_url;
  //     return await instructor.save();
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error; // Rethrow NotFoundException to be handled by the controller
  //     }
  //     if (error.message.includes('Cloudinary')) {
  //       throw new InternalServerErrorException('Failed to upload image to Cloudinary.');
  //     }
  //     console.error('Error in uploadProfileImage service:', error);
  //     throw new InternalServerErrorException('Failed to upload image. Please try again later.');
  //   }
  // }


  async UploadProfileImage(
    userId: string,
    image: Express.Multer.File,
  ): Promise<Instructor> {

    try {
      const instructor = await this.instructorModel.findById(userId).exec();
      if (!instructor) {
        throw new NotFoundException(`Instructor with ID ${userId} not found.`);
      }
      const folderName = 'profileImages'; // or any other dynamic name based on context
      const uploadResult = await this.CloudinaryService.uploadImage(image,folderName);

      if (!uploadResult || !uploadResult.url) {
        throw new InternalServerErrorException('Failed to upload image to Cloudinary.');
      }

      instructor.profileImage = uploadResult.url;
      return await instructor.save();
    }catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Rethrow NotFoundException to be handled by the controller
      }
      if (error.message.includes('Cloudinary')) {
        throw new InternalServerErrorException('Failed to upload image to Cloudinary.');
      }
      console.error('Error in uploadProfileImage service:', error);
      throw new InternalServerErrorException('Failed to upload image. Please try again later.');
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.instructorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }
  }
}