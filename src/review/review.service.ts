import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './entities/review.entity';
import { Model, Types } from 'mongoose';
import { CreateReviewDto } from './dto/create.review.dto';
import { UpdateReviewDto } from './dto/update.review.dto';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';
import { Student } from '../student/entities/student.entity';
import { PaginationDto } from './dto/get.all.reviews.paginated.dto';


@Injectable()
export class ReviewService {
  

  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(Student.name) private readonly studentModel: Model<Student>,
  ) {}
  async createReview(studentId: string, courseId: string, comment: string, rating: number,studentdetails:any): Promise<Review> {
    try {

      const courseObjectId = new Types.ObjectId(courseId);
      // Check if the student exists
      const student = await this.studentModel.findById(studentId).exec();
      if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }
      
      // Check if the course exists
      const course = await this.courseModel.findById(courseId).exec();
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      // Verify if the student is enrolled in the course
      if (!student.coursesEnrolled.includes(courseObjectId)) {
        throw new ConflictException(`Student with ID ${studentId} is not enrolled in the course with ID ${courseId}`);
      }

      // Check if the student has already reviewed this course
      const existingReview = await this.reviewModel.findOne({ student: studentId, courseId }).exec();
      if (existingReview) {
        throw new ConflictException('You have already reviewed this course.');
      }

      // Create the review
      const review = new this.reviewModel({
        firstName:studentdetails.firstName,
        lastName:studentdetails.lastName,
        email:studentdetails.email,
        comment,
        rating,
        courseId: courseId,
        student: studentId,
      });

      // Save the review
      const savedReview = await review.save();

      // Add the new review to the course's reviews array
      await this.courseModel.updateOne(
        { _id: courseId },
        { $push: { reviews: savedReview._id } }
      ).exec();

      // Recalculate the average rating for the course
      const reviews = await this.reviewModel.find({ courseId }).exec();
      const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

      // Update the course with the new average rating
      await this.courseModel.updateOne(
        { _id: courseId },
        { $set: { rating: averageRating } } // Update or set the averageRating field
      ).exec();

      return savedReview;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create review: ' + error.message);
    }
  }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async getReviewsByCourse(courseId: string, paginationDto: PaginationDto) {
  try {
    // const courseObjectId = new Types.ObjectId(courseId);

    // Check if the course exists
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const { page = 1, limit = 10 } = paginationDto;

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Pagination parameters must be greater than 0');
    }

    // Calculate the number of reviews to skip
    const skip = (page - 1) * limit;

    const reviews = await this.reviewModel
      .find({ courseId: courseId })
      .skip(skip)
      .limit(limit)
      .exec();

    // Count total number of reviews
    const totalReviews = await this.reviewModel.countDocuments({ courseId }).exec();

    return {
      totalReviews,
      reviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
    };
  } catch (error) {
    // Categorize and handle errors based on their type
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }

    // General server error handling
    throw new InternalServerErrorException('Failed to retrieve reviews: ' + error.message);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Find a review by its ID
  async findReviewById(Reviewid: string): Promise<Review> {
    return this.reviewModel.findById(Reviewid).exec();
  }


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Update review by ID
   async updateReview(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const updatedReview = await this.reviewModel.findByIdAndUpdate(id, updateReviewDto, { new: true }).exec();
    
    if (!updatedReview) {
      throw new NotFoundException('Review not found');
    }

    return updatedReview;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Delete a review by its ID
  async deleteReview(Reviewid: string): Promise<{ message: string }> {
    const result = await this.reviewModel.findByIdAndDelete(Reviewid).exec();
    
    if (!result) {
      throw new NotFoundException('Review not found');
    }

    return { message: 'Review successfully deleted' };
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



}
