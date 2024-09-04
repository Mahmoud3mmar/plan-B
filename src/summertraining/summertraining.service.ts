import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateSummertrainingDto } from './dto/update.summertraining.dto';
import { CreateSummerTrainingDto } from './dto/create.summertraining.dto';
import { SummerTraining } from './entities/summertraining.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SummertrainingService {
  constructor(
    @InjectModel(SummerTraining.name) private readonly summerTrainingModel: Model<SummerTraining>,
  ) {}

  async create(createDto: CreateSummerTrainingDto): Promise<SummerTraining> {
    const createdTraining = new this.summerTrainingModel(createDto);
    return createdTraining.save();
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: SummerTraining[], total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.summerTrainingModel.find().skip(skip).limit(limit).exec(),
      this.summerTrainingModel.countDocuments().exec(),
    ]);
    return { data, total };
  }

  async findOne(id: string): Promise<SummerTraining> {
    const training = await this.summerTrainingModel.findById(id).exec();
    if (!training) {
      throw new NotFoundException(`SummerTraining with ID ${id} not found`);
    }
    return training;
  }

  async update(id: string, updateDto: UpdateSummertrainingDto): Promise<SummerTraining> {
    const updatedTraining = await this.summerTrainingModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!updatedTraining) {
      throw new NotFoundException(`SummerTraining with ID ${id} not found`);
    }
    return updatedTraining;
  }

  async remove(id: string): Promise<void> {
    const result = await this.summerTrainingModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`SummerTraining with ID ${id} not found`);
    }
  }
}