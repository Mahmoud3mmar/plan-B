import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student, StudentSchema } from './entities/student.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Course, CourseSchema } from '../course/entities/course.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema },
      { name: Course.name, schema: CourseSchema }

    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService,CloudinaryService],
})
export class StudentModule {}
