import { Module } from '@nestjs/common';
import { FawryService } from './fawry.service';
import { FawryController } from './fawry.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FawryOrders, FawryOrdersSchema } from './entities/fawry.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'FawryOrders', schema: FawryOrdersSchema }])],

  controllers: [FawryController],
  providers: [FawryService],
})
export class FawryModule {}
