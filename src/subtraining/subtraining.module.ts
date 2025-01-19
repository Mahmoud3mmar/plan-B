import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {  SubTrainingEntity, SubTrainingSchema } from './entities/subtraining.entity';
import { SubtrainingController } from './subtraining.controller';
import { SubtrainingService } from './subtraining.service';
import { FawryModule } from 'src/fawry/fawry.module';
import { SummerTraining, SummerTrainingSchema } from 'src/summertraining/entities/summertraining.entity';
import { Instructor, InstructorSchema } from 'src/instructor/entities/instructor.entity';
import { FawryOrders, FawryOrdersSchema } from 'src/fawry/entities/fawry.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { subTrainingPurchase, subTrainingPurchaseSchema } from './entities/subtraining.purchase.entity';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: SubTrainingEntity.name, schema: SubTrainingSchema },
      { name: SummerTraining.name, schema: SummerTrainingSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: FawryOrders.name, schema: FawryOrdersSchema },
      { name: subTrainingPurchase.name, schema: subTrainingPurchaseSchema }

    ]),
    FawryModule,
  ],
  providers: [SubtrainingService,CloudinaryService],
  controllers: [SubtrainingController],
})
export class SubtrainingModule {}
