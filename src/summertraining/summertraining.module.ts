import { forwardRef, Module } from '@nestjs/common';
import { SummertrainingService } from './summertraining.service';
import { SummertrainingController } from './summertraining.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SummerTraining, SummerTrainingSchema } from './entities/summertraining.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SubTrainingEntity, SubTrainingSchema } from '../subtraining/entities/subtraining.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SummerTraining.name, schema: SummerTrainingSchema }]),
    MongooseModule.forFeature([{ name: SubTrainingEntity.name, schema: SubTrainingSchema }]),
    forwardRef(() => SummertrainingModule), // Use forwardRef here
    // Ensure SubTrainingEntity is also registered
  ],
  controllers: [SummertrainingController],
  providers: [SummertrainingService,CloudinaryService],
})
export class SummertrainingModule {}
