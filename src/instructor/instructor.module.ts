import { Module } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Instructor, InstructorSchema } from './entities/instructor.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SubTrainingEntity, SubTrainingSchema } from '../subtraining/entities/subtraining.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Instructor.name, schema: InstructorSchema },
    { name: User.name, schema: UserSchema },
    { name: SubTrainingEntity.name, schema: SubTrainingSchema }

  
  ]),
  ],
  controllers: [InstructorController],
  providers: [InstructorService,CloudinaryService],
})
export class InstructorModule {}
