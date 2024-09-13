import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';
import { Course } from './entities/course.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/common utils/Role.enum';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GetCoursesDto } from './dto/get.courses.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly CloudinaryService: CloudinaryService,
  ) {}

  async createCourse(
    createCourseDto: CreateCourseDto,
    instructorId?: string,
  ): Promise<Course> {
    try {
      // If an instructorId is provided, validate the instructor
      if (instructorId) {
        const instructor = await this.userModel.findById(instructorId).exec();

        if (!instructor) {
          throw new NotFoundException('Instructor not found');
        }

        if (instructor.role !== Role.INSTRUCTOR) {
          throw new ForbiddenException('User is not an instructor');
        }

        // Create the course with the validated instructorId
        return await this.courseModel.create({
          ...createCourseDto,
          instructor: instructorId, // Associate the validated instructor
        });
      }

      // Create the course without the instructor validation if no instructorId is provided
      return await this.courseModel.create(createCourseDto);
    } catch (error) {
      // Handle any unexpected errors
      throw new InternalServerErrorException(
        'Failed to create course',
        error.message,
      );
    }
  }

  async uploadCourseImage(
    image: Express.Multer.File,
  ): Promise<{ message: string; imageUrl: string }> {
    try {
      const folderName = 'courseImages'; // Adjust folder name as needed
      const uploadResult = await this.CloudinaryService.uploadImage(
        image,
        folderName,
      );

      return {
        message: 'Image uploaded successfully',
        imageUrl: uploadResult.secure_url, // Or whatever property your service returns
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload image',
        error.message,
      );
    }
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel
      .findById(id)
      .populate('instructor')
      .populate('faqs')
      .populate('reviews')
      .exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async updateCourse(
    courseId: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    try {
      // Find the course by ID
      const course = await this.courseModel.findById(courseId).exec();

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      // Update course with provided fields
      Object.assign(course, updateCourseDto);

      // Save the updated course
      return await course.save();
    } catch (error) {
      // Handle any unexpected errors
      throw new InternalServerErrorException(
        'Failed to update course',
        error.message,
      );
    }
  }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async remove(id: string): Promise<void> {
    const result = await this.courseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async getAllCourses(getCoursesDto: GetCoursesDto): Promise<Course[]> {
    const { page = 1, limit = 10, sortOrder = 'asc', level, isPaid, instructorName, category, rating } = getCoursesDto;

    // Convert sortOrder to Mongoose sort format
    const sort = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip and limit for pagination
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    if (level) filter.level = level;
    if (isPaid !== undefined) filter.isPaid = isPaid;
    if (instructorName) {
      // Use regex to perform a case-insensitive search on the instructor's name
      filter['instructor.name'] = new RegExp(instructorName, 'i');
    } 
    if (category) filter.category = category;
    if (rating !== undefined) filter.rating = { $gte: rating };

    try {
      return await this.courseModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: sort }) // Sort by creation date
        .populate('instructor') // Populate instructor details if needed
        .exec();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new InternalServerErrorException('Failed to fetch courses', error.message);
    }
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async findAllCourses(
    page: number = 1,
    limit: number = 10,
    sortOrder: 'asc' | 'desc' = 'desc',
    filters?: {
      category?: string;
      instructorName?: string;
      isPaid?: boolean;
      rating?: number;
      level?: string;
    }
  ): Promise<Course[]> {
    const query: FilterQuery<Course> = this.buildQuery(filters);
    const skip = this.calculateSkip(page, limit);
    const sort = this.buildSort(sortOrder);

    console.log('Query:', query); // Log the query to debug
    console.log('Skip:', skip); // Log skip value for debugging
    console.log('Sort:', sort); // Log sort value for debugging

    try {
      const courses = await this.courseModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate('courseCurriculum') // Populate courseCurriculum references
        .populate('instructor') // Populate instructor details if needed
        .populate('faqs') // Populate FAQ references
        .populate('reviews') // Populate Review references
        .exec();

      console.log('Courses found:', courses); // Log the result
      return courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error; // or handle the error as appropriate
    }
  }

  private buildQuery(filters?: {
    category?: string;
    instructorName?: string;
    isPaid?: boolean;
    rating?: number;
    level?: string;
  }): FilterQuery<Course> {
    const query: FilterQuery<Course> = {};

    if (filters) {
      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.instructorName) {
        query['instructor.name'] = {
          $regex: filters.instructorName,
          $options: 'i',
        };
      }
      if (filters.isPaid !== undefined) {
        query.isPaid = filters.isPaid;
      }
      if (filters.rating !== undefined) {
        // Ensure rating is a valid number
        const rating = Number(filters.rating);
        if (!isNaN(rating)) {
          query.rating = rating;
        } else {
          console.warn('Invalid rating value:', filters.rating);
        }
      }
      if (filters.level) {
        query.level = filters.level;
      }
    }

    return query;
  }

  private calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  private buildSort(sortOrder: 'asc' | 'desc'): { [key: string]: 1 | -1 } {
    return { rating: sortOrder === 'asc' ? 1 : -1 }; // Default sorting by rating
  }
  
}
