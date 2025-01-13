import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Events, EventSchema } from './entities/event.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FawryModule } from '../fawry/fawry.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Events.name, schema: EventSchema }]),
    FawryModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, CloudinaryService],
  exports: [EventsService],
})
export class EventsModule {}
