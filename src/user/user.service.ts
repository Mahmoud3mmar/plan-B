import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Instructor } from 'src/instructor/entities/instructor.entity';
import { Student } from 'src/student/entities/student.entity';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Instructor.name) private readonly instructorModel: Model<Instructor>,
    @InjectModel(Student.name) private readonly studentModel: Model<Student>,
  ) {}

  async deleteUser(userId: string): Promise<void> {
    try {
      // Find and delete the user by ID
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Delete role-specific data based on the user's role
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
}