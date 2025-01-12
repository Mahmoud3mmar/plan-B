import { Module } from '@nestjs/common';
import { SubtrainingService } from './subtraining.service';
import { SubtrainingController } from './subtraining.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SummerTraining, SummerTrainingSchema } from '../summertraining/entities/summertraining.entity';
import { SubTrainingEntity, SubTrainingSchema } from './entities/subtraining.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Instructor, InstructorSchema } from '../instructor/entities/instructor.entity';
import { FawryService } from 'src/fawry/fawry.service';
import { FawryModule } from 'src/fawry/fawry.module';
import { FawryOrders, FawryOrdersSchema } from 'src/fawry/entities/fawry.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubTrainingEntity.name, schema: SubTrainingSchema },
      { name: SummerTraining.name, schema: SummerTrainingSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: FawryOrders.name, schema: FawryOrdersSchema },

    ]),
    FawryModule,
  ],
  controllers: [SubtrainingController],
  providers: [SubtrainingService, CloudinaryService, FawryService],
})
export class SubtrainingModule {}
