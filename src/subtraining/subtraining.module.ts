import { Module } from '@nestjs/common';
import { SubtrainingService } from './subtraining.service';
import { SubtrainingController } from './subtraining.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SummerTraining, SummerTrainingSchema } from '../summertraining/entities/summertraining.entity';
import { SubTrainingEntity, SubTrainingSchema } from './entities/subtraining.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Instructor, InstructorSchema } from '../instructor/entities/instructor.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SummerTraining.name, schema: SummerTrainingSchema },
      { name: SubTrainingEntity.name, schema: SubTrainingSchema },
      { name: Instructor.name, schema: InstructorSchema },

    ]),
  ],
  controllers: [SubtrainingController],
  providers: [SubtrainingService,CloudinaryService],
})
export class SubtrainingModule {}
