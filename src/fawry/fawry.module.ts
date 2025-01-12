import { Module } from '@nestjs/common';
import { FawryService } from './fawry.service';
import { FawryController } from './fawry.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FawryOrders, FawryOrdersSchema } from './entities/fawry.entity';
import { SubTrainingEntity, SubTrainingSchema } from 'src/subtraining/entities/subtraining.entity';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FawryOrders.name, schema: FawryOrdersSchema },
      { name: SubTrainingEntity.name, schema: SubTrainingSchema },

    ]),
    StudentModule,
  ],
  controllers: [FawryController],
  providers: [FawryService],
  exports: [FawryService]
})
export class FawryModule {}
