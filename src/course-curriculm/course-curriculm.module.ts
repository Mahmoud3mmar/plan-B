import { Module } from '@nestjs/common';
import { CourseCurriculmService } from './course-curriculm.service';
import { CourseCurriculmController } from './course-curriculm.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../vedio/entities/vedio.entity';
import { CourseCurriculum, CourseCurriculumSchema } from './entities/course-curriculm.entity';
import { CurriculumBlock, CurriculumBlockSchema } from '../curriculum-block/entities/curriculum.block.entity';
import { Course, CourseSchema } from '../course/entities/course.entity';

@Module({ imports: [
  MongooseModule.forFeature([ { name: Course.name, schema: CourseSchema },
    { name: Video.name, schema: VideoSchema },
    { name: CourseCurriculum.name, schema: CourseCurriculumSchema },
    { name: CurriculumBlock.name, schema: CurriculumBlockSchema },


  ]),
],
  controllers: [CourseCurriculmController],
  providers: [CourseCurriculmService],
})
export class CourseCurriculmModule {}
