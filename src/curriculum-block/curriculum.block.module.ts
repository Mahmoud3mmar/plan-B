import { Module } from '@nestjs/common';
import { CurriculumBlockService } from './curriculum.block.service';
import { CurriculumBlockController } from './curriculum.block.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CurriculumBlock, CurriculumBlockSchema } from './entities/curriculum.block.entity';
import { Course, CourseSchema } from 'src/course/entities/course.entity';
import { CourseCurriculum, CourseCurriculumSchema } from 'src/course-curriculm/entities/course-curriculm.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CurriculumBlock.name, schema: CurriculumBlockSchema },

      { name: Course.name, schema: CourseSchema },
      { name: CourseCurriculum.name, schema: CourseCurriculumSchema },

    ]),
  ],
  controllers: [CurriculumBlockController],
  providers: [CurriculumBlockService],
})
export class CurriculumBlockModule {}
