import { Module } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Faq, FaqSchema } from './entities/faq.entity';
import { Course, CourseSchema } from '../course/entities/course.entity';
import { FaqsController } from './faqs.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Faq.name, schema: FaqSchema },
    { name: Course.name, schema: CourseSchema }

  ])],

  controllers: [FaqsController],
  providers: [FaqsService],
})
export class FaqsModule {}
