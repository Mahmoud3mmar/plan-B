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

  async getInstructors(
    page: number = 1,
    limit: number = 10,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ data: Instructor[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const sort: { [key: string]: 1 | -1 } = { name: sortOrder === 'asc' ? 1 : -1 }; // Correctly specifying sort

      const [total, data] = await Promise.all([
        this.instructorModel.countDocuments().exec(),
        this.instructorModel.find().skip(skip).limit(limit).sort(sort).exec(),
      ]);

      return { data, total };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve instructors', error.message);
    }
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
    try {
      // Find the instructor by ID
      const instructor = await this.instructorModel.findById(userId).exec();
      // if (!instructor) {
      //   throw new NotFoundException(`Instructor with ID ${userId} not found`);
      // }

      // Update instructor details
      const updatedInstructor = Object.assign(instructor, updateInstructorDto);

      // Save the updated instructor
      await updatedInstructor.save();

      // Update corresponding user details if needed
      const user = await this.UserModel.findById(userId).exec();
      if (user) {
        // Update user details if necessary, e.g., update profileImage or other user-related info
        const { firstName, lastName } = updateInstructorDto;
        if ( firstName || lastName) {
          const updatedUser = Object.assign(user, {firstName, lastName });
          await updatedUser.save();
        }
      }

      return updatedInstructor;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update instructor');
    }
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
      // if (!instructor) {
      //   throw new NotFoundException(`Instructor with ID ${userId} not found.`);
      // }
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
 // Function to delete an instructor
 async deleteInstructor(instructorId: string): Promise<{ message: string }> {
  try {
    // Find the instructor by ID
    const instructor = await this.instructorModel.findById(instructorId);
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${instructorId} not found`);
    }

    // Delete the instructor document
    await this.instructorModel.deleteOne({ _id: instructorId });

    // Delete the corresponding user document
    const user = await this.UserModel.findById(instructor._id); // Assuming the _id matches
    if (!user) {
      throw new NotFoundException(`User for Instructor ID ${instructorId} not found`);
    }

    await this.UserModel.deleteOne({ _id: user._id });

    return { message: `Instructor with ID ${instructorId}  deleted successfully` };
  } catch (error) {
    throw new InternalServerErrorException('Failed to delete instructor', error.message);
  }
}
}