import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './entities/review.entity';
import { Course, CourseSchema } from '../course/entities/course.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { Student, StudentSchema } from '../student/entities/student.entity';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Review.name, schema: ReviewSchema },
    { name:Course.name, schema: CourseSchema },
    { name:Student.name, schema: StudentSchema },

  ])],

  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
