import { Module } from '@nestjs/common';
import { FawryService } from './fawry.service';
import { FawryController } from './fawry.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FawryOrders, FawryOrdersSchema } from './entities/fawry.entity';
import { SubTrainingEntity, SubTrainingSchema } from 'src/subtraining/entities/subtraining.entity';
import { StudentModule } from '../student/student.module';
import { Events, EventSchema } from 'src/events/entities/event.entity';
import { Course, CourseSchema } from 'src/course/entities/course.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FawryOrders.name, schema: FawryOrdersSchema },
      { name: SubTrainingEntity.name, schema: SubTrainingSchema },
      { name: Events.name, schema: EventSchema },
      { name: Course.name, schema: CourseSchema },

    ]),
    StudentModule,
  ],
  controllers: [FawryController],
  providers: [FawryService],
  exports: [FawryService]
})
export class FawryModule {}
