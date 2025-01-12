import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student, StudentSchema } from './entities/student.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Course, CourseSchema } from '../course/entities/course.entity';
import { Events, EventSchema } from '../events/entities/event.entity';
import { SubTrainingEntity, SubTrainingSchema } from 'src/subtraining/entities/subtraining.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Events.name, schema: EventSchema },
      { name: SubTrainingEntity.name, schema: SubTrainingSchema },
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService, CloudinaryService],
  exports: [StudentService],
})
export class StudentModule {}
