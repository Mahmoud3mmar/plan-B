import { Module } from '@nestjs/common';
import { FawryService } from './fawry.service';
import { FawryController } from './fawry.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FawryOrders, FawryOrdersSchema } from './entities/fawry.entity';
import { SubTrainingEntity, SubTrainingSchema } from 'src/subtraining/entities/subtraining.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'FawryOrders', schema: FawryOrdersSchema },
    { name: SubTrainingEntity.name, schema: SubTrainingSchema },

  ])],

  controllers: [FawryController],
  providers: [FawryService],
})
export class FawryModule {}
