import {
  BadRequestException,
  ConflictException,
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
  ): Promise<Course> {
    try {
      // Initialize instructor with null
      const courseData = {
        ...createCourseDto,
        instructor: null, // Initialize with null to allow for later assignment
      };

      // Create the course with the instructor field set to null
      return await this.courseModel.create(courseData);

    } catch (error) {
      if (error.name === 'ValidationError') {
        // Handle validation errors
        throw new BadRequestException('Invalid data provided for course creation', error.message);
      } else if (error.code && error.code === 11000) {
        // Handle duplicate key errors (e.g., unique constraint violations)
        throw new ConflictException('Course with the provided data already exists', error.message);
      } else if (error.name === 'MongoServerError' && error.message.includes('E11000')) {
        // Specific handling for MongoDB duplicate key errors
        throw new ConflictException('Duplicate course entry detected', error.message);
      } else {
        // Handle unexpected errors
        throw new InternalServerErrorException('Failed to create course', error.message);
      }
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
  ): Promise<{ courses: Course[]; total: number; totalPages: number }> {
    const query: FilterQuery<Course> = this.buildQuery(filters);
    const skip = this.calculateSkip(page, limit);
    const sort = this.buildSort(sortOrder);

    try {
      const [total, courses] = await Promise.all([
        this.courseModel.countDocuments(query).exec(),
        this.courseModel
          .find(query)
          .skip(skip)
          .limit(limit)
          .sort(sort)
          .populate('courseCurriculum')
          .populate('instructor')
          .populate('faqs')
          .populate('reviews')
          .exec(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return { courses, total, totalPages };
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new InternalServerErrorException('Failed to fetch courses');
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
        const rating = Number(filters.rating);
        if (!isNaN(rating)) {
          query.rating = rating;
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
    return { rating: sortOrder === 'asc' ? 1 : -1 };
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// async assignCourseToInstructor(courseId: string, instructorId: string): Promise<Course> {
//   try {
//     if (!courseId || !instructorId) {
//       throw new BadRequestException('Course ID and Instructor ID must be provided');
//     }

//     // Validate courseId
//     const course = await this.courseModel.findById(courseId).exec();
//     if (!course) {
//       throw new NotFoundException(`Course with ID ${courseId} not found`);
//     }

//     // Validate instructorId
//     const instructor = await this.userModel.findById(instructorId).exec();
//     if (!instructor) {
//       throw new NotFoundException(`Instructor with ID ${instructorId} not found`);
//     }

//     if (instructor.role !== 'INSTRUCTOR') { // Replace 'INSTRUCTOR' with your actual role value
//       throw new ForbiddenException(`User with ID ${instructorId} is not an instructor`);
//     }

//     // Update course with the new instructor
//     course.instructor = instructorId;
//     await course.save();

//     return course;
//   } catch (error) {
//     this.handleError(error);
//   }
// }

// private handleError(error: any) {
//   if (error instanceof NotFoundException || error instanceof ForbiddenException) {
//     throw error; // Rethrow known exceptions
//   } else if (error instanceof BadRequestException) {
//     throw new BadRequestException(error.message);
//   } else {
//     console.error('Internal server error:', error);
//     throw new InternalServerErrorException('Failed to assign course to instructor', error.message);
//   }
// }
}