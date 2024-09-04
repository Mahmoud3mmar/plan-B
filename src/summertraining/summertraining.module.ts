import { Module } from '@nestjs/common';
import { SummertrainingService } from './summertraining.service';
import { SummertrainingController } from './summertraining.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SummerTraining, SummerTrainingSchema } from './entities/summertraining.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SummerTraining.name, schema: SummerTrainingSchema },
      
    ]),
  ],
  controllers: [SummertrainingController],
  providers: [SummertrainingService],
})
export class SummertrainingModule {}
