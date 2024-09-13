import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course, CourseSchema } from './entities/course.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CourseCurriculum ,CourseCurriculumSchema} from '../course-curriculm/entities/course-curriculm.entity';
import { Faq, FaqSchema } from '../faqs/entities/faq.entity';
import { Instructor, InstructorSchema } from '../instructor/entities/instructor.entity';
import { Review, ReviewSchema } from '../review/entities/review.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: CourseCurriculum.name, schema: CourseCurriculumSchema },
      { name: Faq.name, schema: FaqSchema },
      { name: User.name, schema: UserSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],

  controllers: [CourseController],
  providers: [CourseService,CloudinaryService],
})
export class CourseModule {}
