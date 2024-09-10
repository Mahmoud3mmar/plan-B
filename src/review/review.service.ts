import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './entities/review.entity';
import { Model } from 'mongoose';
import { CreateReviewDto } from './dto/create.review.dto';
import { UpdateReviewDto } from './dto/update.review.dto';
import { Course } from 'src/course/entities/course.entity';


@Injectable()
export class ReviewService {
  


  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>,
  @InjectModel(Course.name) private readonly courseModel: Model<Course>,
  // private readonly enrollmentService: EnrollmentService,
) {}

  async createReview(createReviewDto: CreateReviewDto, userId: string,courseId: string) {
    // Check if the course exists
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found.`);
    }

    // // Check if the user is enrolled in the course
    // const isEnrolled = await this.enrollmentService.isStudentEnrolledInCourse(userId, courseId);
    // if (!isEnrolled) {
    //   throw new ForbiddenException('You are not enrolled in this course, so you cannot leave a review.');
    // }

    // Create and save the review
    const review = new this.reviewModel({
      ...createReviewDto,
      courseId:courseId, // Associate review with the course
      student: userId, // Associate review with the student
    });

    return review.save();
  }


  // Find a review by its ID
  async findReviewById(Reviewid: string): Promise<Review> {
    return this.reviewModel.findById(Reviewid).exec();
  }



   // Update review by ID
   async updateReview(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const updatedReview = await this.reviewModel.findByIdAndUpdate(id, updateReviewDto, { new: true }).exec();
    
    if (!updatedReview) {
      throw new NotFoundException('Review not found');
    }

    return updatedReview;
  }
  // Delete a review by its ID
  async deleteReview(Reviewid: string): Promise<{ message: string }> {
    const result = await this.reviewModel.findByIdAndDelete(Reviewid).exec();
    
    if (!result) {
      throw new NotFoundException('Review not found');
    }

    return { message: 'Review successfully deleted' };
  }
}
