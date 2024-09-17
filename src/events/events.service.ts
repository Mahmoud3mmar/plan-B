import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventDto } from './dto/create.event.dto';
import { Events } from './entities/event.entity';
import { UpdateEvent } from 'typeorm';
import { UpdateEventDto } from './dto/update.event.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PaginateDto } from './dto/get.events.dto';


@Injectable()
export class EventsService {
  constructor(@InjectModel(Events.name) private readonly eventModel: Model<Events>
    , private readonly CloudinaryService: CloudinaryService) {}

    async createEvent(
      createEventDto: CreateEventDto,
      speakerImageFile: Express.Multer.File,
      thumbnailImageFile: Express.Multer.File
    ): Promise<Events> {
      try {
        // Log the incoming DTO and files
        console.log('Received CreateEventDto:', createEventDto);
        console.log('Received speakerImageFile:', speakerImageFile);
        console.log('Received thumbnailImageFile:', thumbnailImageFile);
  
        if (!speakerImageFile || !thumbnailImageFile) {
          throw new BadRequestException('Both speaker image and thumbnail image are required');
        }
  
        // Define folder names for Cloudinary uploads
        const speakerFolderName = 'Events-Speaker';
        const thumbnailFolderName = 'Events-Thumbnail';
  
        // Upload the speaker image
        console.log('Uploading speaker image...');
        const speakerImageUploadResult = await this.CloudinaryService.uploadImage(speakerImageFile, speakerFolderName);
        console.log('Speaker image upload result:', speakerImageUploadResult);
  
        // Upload the thumbnail image
        console.log('Uploading thumbnail image...');
        const thumbnailImageUploadResult = await this.CloudinaryService.uploadImage(thumbnailImageFile, thumbnailFolderName);
        console.log('Thumbnail image upload result:', thumbnailImageUploadResult);
  
        // Create the event with the uploaded image URLs
        const createdEvent = new this.eventModel({
          ...createEventDto,
          speakerImage: speakerImageUploadResult.secure_url, // Use the uploaded speaker image URL
          thumbnailImage: thumbnailImageUploadResult.secure_url, // Use the uploaded thumbnail image URL
        });
  
        console.log('Creating event with data:', createdEvent);
  
        const savedEvent = await createdEvent.save();
        console.log('Event created successfully:', savedEvent);
  
        return savedEvent;
      } catch (error) {
        console.error('Error creating event:', error.message || error);
        throw new InternalServerErrorException('Failed to create event');
      }
    }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async getAllEvents(paginateDto: PaginateDto): Promise<any> {
      const { page = 1, limit = 10, sort = 'eventDate', order = 'asc' } = paginateDto;
  
      try {
        const events = await this.eventModel
          .find()
          .sort({ [sort]: order === 'asc' ? 1 : -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .exec();
  
        const totalEvents = await this.eventModel.countDocuments().exec();
  
        return {
          total: totalEvents,
          page,
          limit,
          events,
        };
      } catch (error) {
        console.error('Error fetching events:', error.message || error);
        throw new InternalServerErrorException('Failed to fetch events');
      }
    }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async getEventById(eventId: string): Promise<Events> {
    try {
      const event = await this.eventModel.findById(eventId).exec();
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }
      return event;
    } catch (error) {
      console.error('Error fetching event by ID:', error.message || error);
      throw new InternalServerErrorException('Failed to fetch event');
    }
  }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async updateEvent(
  eventId: string,
  updateEventDto: UpdateEventDto,
  speakerImageFile?: Express.Multer.File,
  thumbnailImageFile?: Express.Multer.File,
): Promise<Events> {
  try {
    // Find the existing event
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Handle file uploads if provided
    if (speakerImageFile) {
      const speakerImageUploadResult = await this.CloudinaryService.uploadImage(speakerImageFile, 'Events-Speaker');
      updateEventDto.speakerImage = speakerImageUploadResult.secure_url;
    }

    if (thumbnailImageFile) {
      const thumbnailImageUploadResult = await this.CloudinaryService.uploadImage(thumbnailImageFile, 'Events-Thumbnail');
      updateEventDto.thumbnailImage = thumbnailImageUploadResult.secure_url;
    }

    // Update the event with the provided details
    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      eventId,
      { $set: updateEventDto },
      { new: true, useFindAndModify: false }
    ).exec();

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return updatedEvent;
  } catch (error) {
    console.error('Error updating event:', error.message || error);
    throw new InternalServerErrorException('Failed to update event');
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const result = await this.eventModel.findByIdAndDelete(eventId).exec();
      if (!result) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }
    } catch (error) {
      console.error('Error deleting event:', error.message || error);
      throw new InternalServerErrorException('Failed to delete event');
    }
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
  async getNearestEvent(): Promise<Events> {
    try {
      const now = new Date();

      // Using aggregation to find the nearest upcoming event
      const [nearestEvent] = await this.eventModel.aggregate([
        {
          $match: {
            eventDate: { $gte: now }, // Match events with dates >= current date
          },
        },
        {
          $sort: { eventDate: 1 }, // Sort by eventDate in ascending order
        },
        {
          $limit: 1, // Limit to 1 result (the nearest upcoming event)
        },
      ]);

      if (!nearestEvent) {
        console.warn('No upcoming events found');
        throw new NotFoundException('No upcoming events found');
      }

      console.log('Nearest upcoming event:', nearestEvent);
      return nearestEvent;
    } catch (error) {
      console.error('Error retrieving the nearest event:', error.message || error);
      throw new InternalServerErrorException('Failed to retrieve the nearest event');
    }
  }
}
