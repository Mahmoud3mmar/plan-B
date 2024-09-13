import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Student } from '../student/entities/student.entity';
import { Model } from 'mongoose';
import { Role } from './common utils/Role.enum';
import { createInstructorDto } from './dto/create.instructor.dto';

import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Instructor.name) private readonly instructorModel: Model<Instructor>,
    @InjectModel(Student.name) private readonly studentModel: Model<Student>,

    private readonly AuthService: AuthService,
  ) {}

  async deleteUser(userId: string): Promise<void> {
    try {
      // Check if the user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Delete role-specific data
      if (user.role === 'INSTRUCTOR') {
        await this.instructorModel.deleteOne({ _id: userId });
      } else if (user.role === 'STUDENT') {
        await this.studentModel.deleteOne({ _id: userId });
      }

      // Delete the user record
      await this.userModel.findByIdAndDelete(userId);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async createInstructor(createInstructorDto: createInstructorDto): Promise<{ newInstructor: Instructor; message: string }> {
    return this.AuthService.createInstructor(createInstructorDto);
  }
}