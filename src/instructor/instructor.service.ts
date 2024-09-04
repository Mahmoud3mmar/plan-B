import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInstructorDto } from './dto/create.instructor.dto';
import { UpdateInstructorDto } from './dto/update.instructor.dto';
import { Instructor } from './entities/instructor.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class InstructorService {
  constructor(@InjectModel(Instructor.name) private instructorModel: Model<Instructor>) {}

  async create(createInstructorDto: CreateInstructorDto): Promise<Instructor> {
    const instructor = new this.instructorModel(createInstructorDto);
    return await instructor.save();
  }

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

  async update(id: string, updateInstructorDto: UpdateInstructorDto): Promise<Instructor> {
    const instructor = await this.instructorModel.findByIdAndUpdate(id, updateInstructorDto, { new: true }).exec();
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }
    return instructor;
  }

  async remove(id: string): Promise<void> {
    const result = await this.instructorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }
  }
}