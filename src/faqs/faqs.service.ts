import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFaqDto } from './dto/create.faq.dto';
import { UpdateFaqDto } from './dto/update.faq.dto';
import { Faq } from './entities/faq.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class FaqsService {
  constructor(
    @InjectModel(Faq.name) private readonly faqModel: Model<Faq>,
  ) {}

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    const createdFaq = new this.faqModel(createFaqDto);
    return createdFaq.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Faq[], total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.faqModel.find().skip(skip).limit(limit).exec(),
      this.faqModel.countDocuments().exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<Faq> {
    const faq = await this.faqModel.findById(id).exec();
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async update(id: string, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.faqModel.findByIdAndUpdate(id, updateFaqDto, { new: true }).exec();
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async remove(id: string): Promise<void> {
    const result = await this.faqModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
  }
}