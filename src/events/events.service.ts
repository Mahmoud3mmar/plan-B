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
      image: Express.Multer.File
    ): Promise<Events> {
      // Check if the image is provided
      this.validateImage(image);
    
      // Define folder name for Cloudinary uploads
      const thumbnailFolderName = 'Events-Thumbnail';
    
      try {
        // Upload the thumbnail image to Cloudinary
        const thumbnailImageUrl = await this.uploadThumbnailImage(image, thumbnailFolderName);
    
        // Create and save the event
        return await this.saveEvent(createEventDto, thumbnailImageUrl);
      } catch (error) {
        console.error('Error creating event:', error.message || error);
        throw new InternalServerErrorException('Failed to create event');
      }
    }
    
    // Validate the uploaded image
    private validateImage(image: Express.Multer.File): void {
      if (!image) {
        throw new BadRequestException('Image is required');
      }
    }
    
    // Upload the image to Cloudinary
    private async uploadThumbnailImage(image: Express.Multer.File, folderName: string): Promise<string> {
      console.log('Uploading thumbnail image...');
      const uploadResult = await this.CloudinaryService.uploadImage(image, folderName);
      console.log('Thumbnail image upload result:', uploadResult);
      return uploadResult.secure_url; // Return the uploaded image URL
    }
    
    // Save the event to the database
    private async saveEvent(createEventDto: CreateEventDto, thumbnailImageUrl: string): Promise<Events> {
      const createdEvent = new this.eventModel({
        ...createEventDto,
        thumbnailImage: thumbnailImageUrl,
      });
    
      console.log('Creating event with data:', createdEvent);
      const savedEvent = await createdEvent.save();
      console.log('Event created successfully:', savedEvent);
      return savedEvent;
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
  thumbnailImageFile: Express.Multer.File // Only accept the thumbnail image file
): Promise<Events> {
  try {
    // Find the existing event
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Upload the thumbnail image if provided
    const thumbnailImageUploadResult = await this.CloudinaryService.uploadImage(thumbnailImageFile, 'Events-Thumbnail');
    updateEventDto.thumbnailImage = thumbnailImageUploadResult.secure_url; // Update the DTO with the new URL

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
