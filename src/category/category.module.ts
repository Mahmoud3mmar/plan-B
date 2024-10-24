import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category, CategorySchema } from './entities/category.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Course, CourseSchema } from '../course/entities/course.entity';
import { CourseCurriculum } from '../course-curriculm/entities/course-curriculm.entity';
import { CurriculumBlock } from '../curriculum-block/entities/curriculum.block.entity';
import { Video } from '../vedio/entities/vedio.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema },
      { name: Course.name, schema: CourseSchema },

      { name: CourseCurriculum.name, schema: CourseCurriculum },

      { name: CurriculumBlock.name, schema: CurriculumBlock },
      { name: Video.name, schema: Video },


    ]),
  ],
  providers: [CategoryService,CloudinaryService],
  controllers: [CategoryController],
  exports: [CategoryService], // Export CategoryService if used in other modules
})
export class CategoryModule {}
