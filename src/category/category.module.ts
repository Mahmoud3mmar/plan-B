import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category, CategorySchema } from './entities/category.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Course, CourseSchema } from '../course/entities/course.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema },
      { name: Course.name, schema: CourseSchema }
    ]),
  ],
  providers: [CategoryService,CloudinaryService],
  controllers: [CategoryController],
  exports: [CategoryService], // Export CategoryService if used in other modules
})
export class CategoryModule {}
