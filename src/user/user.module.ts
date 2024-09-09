import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { Instructor, InstructorSchema } from '../instructor/entities/instructor.entity';
import { Student, StudentSchema } from '../student/entities/student.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
    
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
