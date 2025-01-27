import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Query,
  UnauthorizedException,
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
// import { PaymentService } from '../payment/payment.service';
import { v4 as uuidv4 } from 'uuid';
import { PurchaseCourseDto } from './dto/purchase.course.dto';
import { FawryService } from '../fawry/fawry.service'; // Import the FawryService

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    @InjectModel(CourseCurriculum.name)
    private readonly courseCurriculumModel: Model<CourseCurriculum>,
    @InjectModel(Faq.name) private readonly faqModel: Model<Faq>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(CourseCurriculum.name)
    private readonly CourseCurriculumModel: Model<CourseCurriculum>,

    // @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly CloudinaryService: CloudinaryService,
    private readonly CategoryService: CategoryService,
    private readonly fawryService: FawryService, // Inject FawryService

    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<Instructor>,
    // private readonly paymentService: PaymentService,
  ) {}
  async createCourse(
    createCourseDto: CreateCourseDto,
    image: Express.Multer.File,
  ): Promise<Course> {
    try {
      const { categoryId, ...courseData } = createCourseDto;

      // Check if category exists
      if (categoryId) {
        const categoryExists = await this.CategoryService.doesCategoryExist(categoryId.toString());
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

      // Handle image upload if provided
      if (image) {
        const uploadResult = await this.CloudinaryService.uploadImage(
          image,
          'courseImages',
        );
        createdCourse.imageUrl = uploadResult.secure_url; // Save the image URL to the course
        await createdCourse.save();
      }

      // Create a new CourseCurriculum entity for the created course
      const courseCurriculum = new this.CourseCurriculumModel({
        CurriculumBlocks: [], // Initialize with an empty array for blocks
        courseId: createdCourse._id,
      });

      // Save the CourseCurriculum
      const createdCourseCurriculum = await courseCurriculum.save();

      // Update the created course with the curriculum ID by pushing to the array
      createdCourse.courseCurriculum.push(createdCourseCurriculum); // Push the new curriculum ID into the array
      await createdCourse.save();

      // Update the category with the new course ID and increment courseCount
      if (categoryId) {
        await this.CategoryService.addCourseToCategory(
          categoryId.toString(),
          createdCourse._id.toString(),
        );
        await this.CategoryService.incrementCourseCount(categoryId.toString());
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
    image: Express.Multer.File,
  ): Promise<{ message: string; imageUrl: string }> {
    try {
      const folderName = 'courseImages'; // Adjust folder name as needed
      const uploadResult = await this.CloudinaryService.uploadImage(
        image,
        folderName,
      );

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
      .populate({
        path: 'instructor',
        select: '-password', // Exclude sensitive fields if necessary
      })
      .populate('faqs')
      .populate('reviews')
      .populate({
        path: 'courseCurriculum', // Populate course curriculum
        populate: {
          path: 'CurriculumBlocks', // Populate the blocks within the curriculum
          populate: {
            path: 'videos', // Populate videos within each curriculum block
          },
        },
      })
      .populate('category') // Populate category details
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
      const course = await this.courseModel
        .findById(courseId)
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
        await this.videoModel
          .deleteMany({ _id: { $in: course.videos } })
          .exec();
      }

      // Delete related course curriculums
      if (course.courseCurriculum && course.courseCurriculum.length > 0) {
        await this.courseCurriculumModel
          .deleteMany({ _id: { $in: course.courseCurriculum } })
          .exec();
      }

      // Delete related FAQs
      if (course.faqs && course.faqs.length > 0) {
        await this.faqModel.deleteMany({ _id: { $in: course.faqs } }).exec();
      }

      // Delete related reviews
      if (course.reviews && course.reviews.length > 0) {
        await this.reviewModel
          .deleteMany({ _id: { $in: course.reviews } })
          .exec();
      }

      // Update the category (if applicable)
      if (course.category) {
        await this.CategoryService.decrementCourseCount(
          course.category.toString(),
        );
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
    page?: number, // page is optional
    limit?: number, // limit is optional
    sortOrder: 'asc' | 'desc' = 'desc',
    filters?: {
      categoryId?: string;
      instructorName?: string;
      isPaid?: boolean;
      rating?: number;
      level?: string;
    },
  ): Promise<{ courses: Course[]; total: number; totalPages?: number }> {
    // totalPages is optional if no pagination
    const query: FilterQuery<Course> = this.buildQuery(filters);
    const sort = this.buildSort(sortOrder);

    try {
      const total = await this.courseModel.countDocuments(query).exec();

      let coursesQuery = this.courseModel
        .find(query)
        .sort(sort)
        .populate('courseCurriculum')
        .populate({
          path: 'courseCurriculum',
          populate: {
            path: 'CurriculumBlocks',
            model: 'CurriculumBlock',
            populate: {
              path: 'videos',
              model: 'Video',
            },
          },
        })
        .populate('instructor')
        .populate('faqs')
        .populate('reviews')
        .populate('category');

      // Apply pagination only if `page` and `limit` are provided
      if (page && limit) {
        const skip = this.calculateSkip(page, limit);
        coursesQuery = coursesQuery.skip(skip).limit(limit);
      }

      const courses = await coursesQuery.exec();

      // Calculate totalPages only if pagination is used
      const totalPages = limit ? Math.ceil(total / limit) : undefined;

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

  // async accessCourse(courseId: string, userId: string): Promise<boolean> {
  //   // Fetch course details to get the price
  //   const course = await this.courseModel.findById(courseId).exec();
  //   if (!course) {
  //     throw new NotFoundException('Course not found');
  //   }

  //   // Initiate payment
  //   const paymentResponse = await this.paymentService.initiatePayment(courseId, course.price, userId);

  //   // Verify payment
  //   const isPaymentSuccessful = await this.paymentService.verifyPayment(paymentResponse.transactionId);
  //   if (!isPaymentSuccessful) {
  //     throw new UnauthorizedException('Payment verification failed');
  //   }

  //   // Grant access to course videos
  //   // Logic to update user's access to the course

  //   return true;
  // }

  async purchaseCourse(
    courseId: string,
    purchaseDto: PurchaseCourseDto,
    userId: string,
  ): Promise<string> {
    try {
      // Retrieve the course
      const course = await this.courseModel.findById(courseId).exec();
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      // Check if the course is paid
      if (!course.isPaid) {
        throw new BadRequestException(
          'This course is not marked as paid. Purchase cannot proceed.',
        );
      }
      // Convert userId to ObjectId
      const userIdAsObjectId = new Types.ObjectId(userId);
      // Add the user ID to the enrolledStudents array
      if (!course.enrolledStudents.includes(userIdAsObjectId)) {
        course.enrolledStudents.push(userIdAsObjectId);
        await course.save();
      }

      // Create the charge request DTO
      const merchantRefNum = this.generateMerchantRefNum(userId.toString());
      const createChargeRequestDto = {
        merchantCode: '', // Ensure this is set in your environment
        merchantRefNum: merchantRefNum,
        customerMobile: purchaseDto.customerMobile,
        customerEmail: purchaseDto.customerEmail,
        customerName: purchaseDto.customerName,
        language: 'en-gb',
        chargeItems: [
          {
            itemId: course._id.toString(),
            description: course.name,
            price: course.price,
            quantity: 1,
          },
        ],
        returnUrl: 'http://Planp-learning.com', // Your actual return URL
        paymentExpiry: 0, // Set payment expiry as needed
      };

      // Call Fawry service to create charge request
      const redirectUrl = await this.fawryService.createChargeRequest(
        createChargeRequestDto,
      );

      // Ensure redirectUrl is a string
      if (typeof redirectUrl !== 'string') {
        throw new InternalServerErrorException(
          'Invalid redirect URL returned from Fawry service',
        );
      }

      // Return the redirect URL
      return redirectUrl;
    } catch (error) {
      // Handle specific errors
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred while processing the payment request',
        );
      }
    }
  }

  private generateMerchantRefNum(userId: string): string {
    const uuid = uuidv4(); // Generate a UUID
    return `${userId}-${uuid}`; // Combine userId and UUID
  }

  async userHasAccessToCourse(
    courseId: string,
    userId: string,
  ): Promise<boolean> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Convert userId to ObjectId
    const userIdAsObjectId = new Types.ObjectId(userId);

    // Check if the user is enrolled in the course
    return course.enrolledStudents.includes(userIdAsObjectId);
  }
}
