import { Module } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Instructor, InstructorSchema } from './entities/instructor.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Instructor.name, schema: InstructorSchema }]),
  ],
  controllers: [InstructorController],
  providers: [InstructorService],
})
export class InstructorModule {}
