import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Events, EventSchema } from './entities/event.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Events.name, schema: EventSchema },

  ])],
  controllers: [EventsController],
  providers: [EventsService,CloudinaryService], 
  exports: [EventsService] // Export EventsService if used in other modules

})
export class EventsModule {}
