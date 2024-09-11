import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './entities/review.entity';
import { Course, CourseSchema } from '../course/entities/course.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema },{ name:Course.name, schema: CourseSchema }])],

  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
