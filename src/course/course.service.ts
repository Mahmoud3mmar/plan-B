import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';
import { Course } from './entities/course.entity';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const createdCourse = new this.courseModel(createCourseDto);
    return createdCourse.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      category?: string;
      instructorName?: string;
      isPaid?: boolean;
      rating?: number;
      level?: string;
    },
  ): Promise<Course[]> {
    const query: FilterQuery<Course> = {};

    if (filters) {
      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.instructorName) {
        query['instructor.name'] = { $regex: filters.instructorName, $options: 'i' };
      }
      if (filters.isPaid !== undefined) {
        query.isPaid = filters.isPaid;
      }
      if (filters.rating !== undefined) {
        query.rating = filters.rating; // Adjust this line if rating is a subdocument
      }
      if (filters.level) {
        query.level = filters.level;
      }
    }

    const skip = (page - 1) * limit;

    return this.courseModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .populate('Coursecurriculum') // Populate the CourseCurriculum references
      .populate('instructor') // Populate the Instructor reference
      .populate('faqs') // Populate the FAQ references
      .populate('reviews') // Populate the Review references
      .exec();
  }


  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel.findById(id).populate('instructor').populate('faqs').populate('reviews').exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const updatedCourse = await this.courseModel.findByIdAndUpdate(id, updateCourseDto, { new: true }).populate('instructor').populate('faqs').populate('reviews').exec();
    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return updatedCourse;
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}