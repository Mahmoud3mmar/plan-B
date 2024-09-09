import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update.student.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Student } from './entities/student.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Student[], total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.studentModel.find().skip(skip).limit(limit).exec(),
      this.studentModel.countDocuments().exec(),
    ]);
    return { data, total };
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async updateStudent(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    Object.assign(student, updateStudentDto);
    return await student.save();
  }

  async uploadProfileImage(id: string, image: Express.Multer.File): Promise<Student> {
    try {
      const student = await this.studentModel.findById(id).exec();
      if (!student) {
        throw new NotFoundException(`Student with ID ${id} not found.`);
      }

      const folderName = 'profileImages';
      const uploadResult = await this.cloudinaryService.uploadImage(image, folderName);

      if (!uploadResult || !uploadResult.url) {
        throw new InternalServerErrorException('Failed to upload image to Cloudinary.');
      }

      student.profileImage = uploadResult.url;
      return await student.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.message.includes('Cloudinary')) {
        throw new InternalServerErrorException('Failed to upload image to Cloudinary.');
      }
      console.error('Error in uploadProfileImage service:', error);
      throw new InternalServerErrorException('Failed to upload image. Please try again later.');
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.studentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
  }
}
