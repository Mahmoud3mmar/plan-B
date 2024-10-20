import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFaqDto } from './dto/create.faq.dto';
import { UpdateFaqDto } from './dto/update.faq.dto';
import { Faq } from './entities/faq.entity';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class FaqsService {
  constructor(
    @InjectModel(Faq.name) private readonly faqModel: Model<Faq>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>, // Inject the Course model
  ) {}
  async create(createFaqDto: CreateFaqDto, courseId: string): Promise<Faq> {
    try {
      // Step 1: Check if the course exists
      const course = await this.courseModel.findById(courseId).exec();
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }
  
      // Step 2: Create the FAQ document
      const faqData = {
        ...createFaqDto,
        course: courseId, // Link the FAQ to the course by storing the courseId
      };
      const createdFaq = new this.faqModel(faqData);
      const savedFaq = await createdFaq.save();
  
      // Step 3: Update the Course entity to add the new FAQ to the faqs array
      course.faqs.push(savedFaq.id);
      await course.save();
  
      return savedFaq;
    } catch (error) {
      // Handle known error types with specific messages
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error.name === 'ValidationError') {
        // Mongoose validation errors (e.g., missing required fields)
        const validationErrors = Object.values(error.errors).map(err => err).join(', ');
        throw new BadRequestException(`Validation failed: ${validationErrors}`);
      } else if (error.name === 'CastError') {
        // Mongoose CastError when invalid IDs are provided (e.g., malformed courseId)
        throw new BadRequestException(`Invalid ID format: ${error.message}`);
      } else if (error.code === 11000) {
        // Handle duplicate key errors (e.g., unique constraints in MongoDB)
        throw new ConflictException(`Duplicate key error: ${JSON.stringify(error.keyValue)}`);
      }
  
      // Fallback to generic internal server error for unexpected issues
      console.error('Unexpected error creating FAQ:', error); // Log for debugging
      throw new InternalServerErrorException('Failed to create FAQ due to an unexpected error');
    }
  }
  
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Faq[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.faqModel.find().skip(skip).limit(limit).exec(),
      this.faqModel.countDocuments().exec(),
    ]);

    return { data, total };
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async findOne(id: string): Promise<Faq> {
    const faq = await this.faqModel.findById(id).exec();
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async update(id: string, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    try {
      // Update the FAQ document
      const faq = await this.faqModel
        .findByIdAndUpdate(id, updateFaqDto, { new: true })
        .exec();

      if (!faq) {
        throw new NotFoundException(`FAQ with ID ${id} not found`);
      }

      return faq;
    } catch (error) {
      // Handle potential errors
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to update FAQ: ' + error.message,
      );
    }
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async remove(FaqId: string): Promise<string> {
    const faq = await this.faqModel.findById(FaqId).exec();
    
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${FaqId} not found`);
    }
  
    // Delete the FAQ
    await this.faqModel.findByIdAndDelete(FaqId).exec();
  
    // Ensure the course reference is valid and remove FAQ from the associated course
    if (faq.course) {
      const courseId = faq.course; // Adjust based on how the course reference is stored
      await this.courseModel.updateOne(
        { _id: courseId }, // Use courseId directly if it's a string or ensure correct conversion
        { $pull: { faqs: FaqId } } // Remove the FAQ ID from the course's FAQs array
      ).exec();
    } else {
      console.warn(`FAQ with ID ${FaqId} does not have an associated course`);
    }
  
    return `FAQ with ID ${FaqId} successfully deleted`;
  }
}
