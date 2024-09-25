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
import mongoose, { FilterQuery, Model, Types } from 'mongoose';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/common utils/Role.enum';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GetCoursesDto } from './dto/get.courses.dto';
import { Instructor } from '../instructor/entities/instructor.entity';
import { CategoryService } from '../category/category.service';
import { CourseCurriculmService } from '../course-curriculm/course-curriculm.service';
import { Faq } from '../faqs/entities/faq.entity';
import { CourseCurriculum } from '../course-curriculm/entities/course-curriculm.entity';
import { Review } from '../review/entities/review.entity';
import { Video } from '../vedio/entities/vedio.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    @InjectModel(CourseCurriculum.name) private readonly courseCurriculumModel: Model<CourseCurriculum>,
    @InjectModel(Faq.name) private readonly faqModel: Model<Faq>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    // @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly CloudinaryService: CloudinaryService,
    private readonly CategoryService: CategoryService,

    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<Instructor>,
  ) {}
  async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
    try {
      const { categoryId, ...courseData } = createCourseDto;

      // Check if category exists
      if (categoryId) {
        const categoryExists = await this.CategoryService.doesCategoryExist(categoryId);
        if (!categoryExists) {
          throw new NotFoundException('Category not found');
        }
      }

      // Add the category ID to the course data
      const newCourseData = {
        ...courseData,
        category: categoryId ? new Types.ObjectId(categoryId) : null, // Ensure categoryId is of type ObjectId
        instructor: null, // Initialize with null to allow for later assignment
      };

      // Create the course
      const createdCourse = await this.courseModel.create(newCourseData);

      // Update the category with the new course ID
      if (categoryId) {
        await this.CategoryService.addCourseToCategory(categoryId, createdCourse._id.toString());
      }

      return createdCourse;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(
          'Invalid data provided for course creation',
          error.message,
        );
      } else if (error.code && error.code === 11000) {
        throw new ConflictException(
          'Course with the provided data already exists',
          error.message,
        );
      } else if (
        error.name === 'MongoServerError' &&
        error.message.includes('E11000')
      ) {
        throw new ConflictException(
          'Duplicate course entry detected',
          error.message,
        );
      } else {
        throw new InternalServerErrorException(
          'Failed to create course',
          error.message,
        );
      }
    }
  }
  async uploadCourseImage(
    courseId: string,
    image: Express.Multer.File
  ): Promise<{ message: string; imageUrl: string }> {
    try {
      const folderName = 'courseImages'; // Adjust folder name as needed
      const uploadResult = await this.CloudinaryService.uploadImage(image, folderName);

      // Find and update the course document with the new image URL
      const updatedCourse = await this.courseModel.findById(courseId);
      if (!updatedCourse) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      updatedCourse.imageUrl = uploadResult.secure_url; // Update with the returned URL
      await updatedCourse.save();

      return {
        message: 'Image uploaded and course updated successfully',
        imageUrl: uploadResult.secure_url,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload image', error.message);
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
  async deleteCourse(courseId: string): Promise<void> {
    try {
      // Find the course to delete
      const course = await this.courseModel.findById(courseId)
        .populate('videos')
        .populate('courseCurriculum')
        .populate('faqs')
        .populate('reviews')
        .exec();
  
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }
  
      // Delete related videos
      if (course.videos && course.videos.length > 0) {
        await this.videoModel.deleteMany({ _id: { $in: course.videos } }).exec();
      }
  
      // Delete related course curriculums
      if (course.courseCurriculum && course.courseCurriculum.length > 0) {
        await this.courseCurriculumModel.deleteMany({ _id: { $in: course.courseCurriculum } }).exec();
      }
  
      // Delete related FAQs
      if (course.faqs && course.faqs.length > 0) {
        await this.faqModel.deleteMany({ _id: { $in: course.faqs } }).exec();
      }
  
      // Delete related reviews
      if (course.reviews && course.reviews.length > 0) {
        await this.reviewModel.deleteMany({ _id: { $in: course.reviews } }).exec();
      }
  
      // Update the category (if applicable)
      if (course.category) {
        await this.CategoryService.decrementCourseCount(course.category.toString());
      }
  
      // Delete the course
      await this.courseModel.findByIdAndDelete(courseId).exec();
    } catch (error) {
      console.error('Error deleting course:', error);
      throw new InternalServerErrorException('Failed to delete course');
    }
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // async getAllCourses(getCoursesDto: GetCoursesDto): Promise<Course[]> {
  //   const { page = 1, limit = 10, sortOrder = 'asc', level, isPaid, instructorName, category, rating } = getCoursesDto;

  //   // Convert sortOrder to Mongoose sort format
  //   const sort = sortOrder === 'asc' ? 1 : -1;

  //   // Calculate skip and limit for pagination
  //   const skip = (page - 1) * limit;

  //   // Build filter object
  //   const filter: any = {};
  //   if (level) filter.level = level;
  //   if (isPaid !== undefined) filter.isPaid = isPaid;
  //   if (instructorName) {
  //     // Use regex to perform a case-insensitive search on the instructor's name
  //     filter['instructor.name'] = new RegExp(instructorName, 'i');
  //   }
  //   if (category) filter.category = category;
  //   if (rating !== undefined) filter.rating = { $gte: rating };

  //   try {
  //     return await this.courseModel.find(filter)
  //       .skip(skip)
  //       .limit(limit)
  //       .sort({ createdAt: sort }) // Sort by creation date
  //       .populate('instructor') // Populate instructor details if needed
  //       .exec();
  //   } catch (error) {
  //     console.error('Error fetching courses:', error);
  //     throw new InternalServerErrorException('Failed to fetch courses', error.message);
  //   }
  // }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async findAllCourses(
    page: number = 1,
    limit: number = 10,
    sortOrder: 'asc' | 'desc' = 'desc',
    filters?: {
      categoryId?: string;
      instructorName?: string;
      isPaid?: boolean;
      rating?: number;
      level?: string;
    },
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
          .populate({
            path: 'videos', // This should match the field name in your Course schema
            model: 'Video', // Ensure this matches the name of your Video model
          })
          .populate('category') // Populate category field

          .exec(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return { courses, total, totalPages };
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new InternalServerErrorException('Failed to fetch courses');
    }
  }

  /**
   * Build a query object based on provided filters.
   *
   * @param filters - Optional filters for querying courses.
   * @returns The query object for filtering courses.
   */
  private buildQuery(filters: {
    categoryId?: string;
    instructorName?: string;
    isPaid?: boolean;
    rating?: number;
    level?: string;
  }): FilterQuery<Course> {
    const query: FilterQuery<Course> = {};

    if (filters.categoryId) query.category = filters.categoryId;
    if (filters.instructorName)
      query['instructor.name'] = {
        $regex: filters.instructorName,
        $options: 'i',
      };
    if (filters.isPaid !== undefined) query.isPaid = filters.isPaid;
    if (filters.rating) query.rating = { $gte: filters.rating };
    if (filters.level) query.level = filters.level;

    return query;
  }

  /**
   * Calculate the number of documents to skip based on the page number and limit.
   *
   * @param page - The page number to retrieve.
   * @param limit - The number of courses per page.
   * @returns The number of documents to skip.
   */
  private calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Build the sort object based on the sort order.
   *
   * @param sortOrder - The order to sort courses by creation date ('asc' or 'desc').
   * @returns The sort object for querying courses.
   */
  private buildSort(sortOrder: 'asc' | 'desc'): { [key: string]: 1 | -1 } {
    return { createdAt: sortOrder === 'asc' ? 1 : -1 };
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async assignInstructorToCourse(
    courseId: string,
    instructorId: string,
  ): Promise<Course> {
    // Find the course
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Find the instructor
    const instructor = await this.instructorModel.findById(instructorId);
    if (!instructor) {
      throw new NotFoundException(
        `Instructor with ID ${instructorId} not found`,
      );
    }

    // Assign the instructor to the course
    course.instructor = instructor;
    return course.save();
  }
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
