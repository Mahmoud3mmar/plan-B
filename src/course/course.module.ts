import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { CategoryModule } from '../category/category.module'; // Import CategoryModule
import { Course, CourseSchema } from './entities/course.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Instructor, InstructorSchema } from '../instructor/entities/instructor.entity';
import { CourseCurriculum, CourseCurriculumSchema } from '../course-curriculm/entities/course-curriculm.entity';
import { Faq, FaqSchema } from '../faqs/entities/faq.entity';
import { Review, ReviewSchema } from '../review/entities/review.entity';
import { Category, CategorySchema } from '../category/entities/category.entity';
import { Video, VideoSchema } from '../vedio/entities/vedio.entity';
import { CurriculumBlock, CurriculumBlockSchema } from '../curriculum-block/entities/curriculum.block.entity';
import { FawryModule } from '../fawry/fawry.module'; // Import the FawryModule

@Module({
  imports: [
    MongooseModule.forFeature([ { name: Course.name, schema: CourseSchema },
      { name: Video.name, schema: VideoSchema },
      { name: CourseCurriculum.name, schema: CourseCurriculumSchema },
      { name: Faq.name, schema: FaqSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: CourseCurriculum.name, schema: CourseCurriculumSchema },
      { name: CurriculumBlock.name, schema: CurriculumBlockSchema },


    ]),
    CategoryModule, // Import CategoryModule here
    FawryModule, // Add FawryModule here
  ],
  providers: [CourseService,CloudinaryService],
  controllers: [CourseController],
  exports: [CourseService], // Export CourseService if used in other modules
})
export class CourseModule {}
