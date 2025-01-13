import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEventDto } from './dto/create.event.dto';
import { Agenda, Events, Speaker } from './entities/event.entity';
import { UpdateEvent } from 'typeorm';
import { UpdateEventDto } from './dto/update.event.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PaginateDto } from './dto/get.events.dto';
import { AddSpeakerDto } from './dto/add-speakers.dto';
import { AgendaDto } from './dto/agenda.dto';
import { FawryService } from '../fawry/fawry.service';
import { PurchaseEventDto } from './dto/purchase.event.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Events.name) private readonly eventModel: Model<Events>,
    private readonly CloudinaryService: CloudinaryService,
    private readonly fawryService: FawryService,
  ) {}

  async createEvent(
    createEventDto: CreateEventDto,
    image: Express.Multer.File,
  ): Promise<Events> {
    try {
      // Check if the image is provided
      this.validateImage(image);

      // Validate event date
      this.validateEventDate(createEventDto.eventDate);

      // Define folder name for Cloudinary uploads
      const thumbnailFolderName = 'Events-Thumbnail';

      // Upload the thumbnail image to Cloudinary
      const thumbnailImageUrl = await this.uploadThumbnailImage(
        image,
        thumbnailFolderName,
      );

      // Create and save the event
      return await this.saveEvent(createEventDto, thumbnailImageUrl);
    } catch (error) {
      // Log the original error for debugging
      console.error('Error creating event:', error.message || error);

      // Handle BadRequestException (including our custom validations)
      if (error instanceof BadRequestException) {
        throw error; // Re-throw BadRequestException as-is
      }

      // Handle mongoose ValidationError
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new BadRequestException(errorMessages);
      }

      // For any other error, throw a generic InternalServerErrorException
      throw new InternalServerErrorException(
        'Failed to create event. Please try again later.',
      );
    }
  }

  // Validate the uploaded image
  private validateImage(image: Express.Multer.File): void {
    if (!image) {
      throw new BadRequestException('Image is required');
    }
  }

  // Upload the image to Cloudinary
  private async uploadThumbnailImage(
    image: Express.Multer.File,
    folderName: string,
  ): Promise<string> {
    console.log('Uploading thumbnail image...');
    const uploadResult = await this.CloudinaryService.uploadImage(
      image,
      folderName,
    );
    console.log('Thumbnail image upload result:', uploadResult);
    return uploadResult.secure_url; // Return the uploaded image URL
  }

  // Save the event to the database
  private async saveEvent(
    createEventDto: CreateEventDto,
    thumbnailImageUrl: string,
  ): Promise<Events> {
    try {
      const createdEvent = new this.eventModel({
        ...createEventDto,
        thumbnailImage: thumbnailImageUrl,
        speakers: [],
        agenda: [],
        enrolledStudents: [],
      });

      console.log('Creating event with data:', createdEvent);
      const savedEvent = await createdEvent.save();
      console.log('Event created successfully:', savedEvent);
      return savedEvent;
    } catch (error) {
      // Log the error for debugging
      console.error('Error saving event:', error.message || error);

      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new BadRequestException(errorMessages);
      }
      
      // Re-throw the error to be handled by the main try-catch
      throw error;
    }
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async addSpeakerToEvent(
    eventId: string,
    speakerDto: AddSpeakerDto,
    image: Express.Multer.File,
  ): Promise<Events> {
    try {
      // Validate image
      if (!image) {
        throw new BadRequestException('Speaker image is required');
      }
  
      // Find the existing event
      const event = await this.eventModel.findById(eventId).exec();
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }
  
      // Create a Set to avoid duplicate speakers based on name
      const existingSpeakerNames = new Set(event.speakers.map((s) => s.name));
  
      // Check for duplicate speaker
      if (existingSpeakerNames.has(speakerDto.name)) {
        throw new BadRequestException(
          `Speaker with name "${speakerDto.name}" already exists in the event.`,
        );
      }
  
      try {
        // Upload the image to Cloudinary
        const thumbnailFolderName = 'Speakers-Images';
        const uploadResult = await this.CloudinaryService.uploadImage(
          image,
          thumbnailFolderName,
        );
  
        // Create a new Speaker instance with ObjectId
        const speaker = {
          _id: new Types.ObjectId(),
          name: speakerDto.name,
          image: uploadResult.secure_url,
          about: speakerDto.about,
        };
  
        // Add the new speaker to the existing speakers array
        event.speakers.push(speaker);
  
        // Save the updated event
        const updatedEvent = await event.save();
  
        console.log('Speaker added successfully:', updatedEvent);
        return updatedEvent;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new BadRequestException('Failed to upload speaker image');
      }
    } catch (error) {
      // Log the original error for debugging
      console.error('Error adding speaker to event:', error.message || error);
  
      // Re-throw BadRequestException and NotFoundException as is
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
  
      // Handle mongoose ValidationError
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new BadRequestException(errorMessages);
      }
  
      // For any other error, throw InternalServerErrorException
      throw new InternalServerErrorException('Failed to add speaker to event');
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  
  async addAgendaToEvent(
    eventId: string,
    agendaDto: AgendaDto,
  ): Promise<Events> {
    try {
      const event = await this.eventModel.findById(eventId).exec();
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      // Check for duplicate agenda title
      const existingAgendaTitles = new Set(event.agenda.map((a) => a.title));
      if (existingAgendaTitles.has(agendaDto.title)) {
        throw new BadRequestException(
          `Agenda item with title "${agendaDto.title}" already exists in the event.`,
        );
      }

      // Create a new Agenda instance
      const agendaItem = {
        _id: new Types.ObjectId(),
        title: agendaDto.title,
        time: agendaDto.time,
      };

      // Add the new agenda item to the existing agenda array
      event.agenda.push(agendaItem);

      // Save the updated event
      const updatedEvent = await event.save();
      console.log('Agenda item added successfully:', updatedEvent);
      return updatedEvent;
    } catch (error) {
      console.error('Error adding agenda to event:', error.message || error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add agenda to event');
    }
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async getAllEvents(paginateDto: PaginateDto): Promise<any> {
    const {
      page = 1,
      limit = 10,
      sort = 'eventDate',
      order = 'asc',
    } = paginateDto;

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
    image?: Express.Multer.File,
  ): Promise<Events> {
    try {
      // Find the existing event
      const event = await this.eventModel.findById(eventId).exec();
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      // Create update data only with provided fields
      const updateData: Partial<Events> = {};

      // Only add fields that are provided in the DTO
      Object.keys(updateEventDto).forEach(key => {
        if (updateEventDto[key] !== undefined) {
          updateData[key] = updateEventDto[key];
        }
      });

      // Validate event date if it's being updated
      if (updateEventDto.eventDate) {
        this.validateEventDate(updateEventDto.eventDate);
      }

      // Upload and update image only if a new one is provided
      if (image) {
        const thumbnailImageUploadResult = await this.CloudinaryService.uploadImage(
          image,
          'Events-Thumbnail'
        );
        updateData.thumbnailImage = thumbnailImageUploadResult.secure_url;
      }

      // Update the event with only the provided details
      const updatedEvent = await this.eventModel
        .findByIdAndUpdate(
          eventId,
          { $set: updateData },
          { new: true, runValidators: true }
        )
        .exec();

      if (!updatedEvent) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      console.log('Event updated successfully:', updatedEvent);
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error.message || error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map(
          (err: any) => err.message
        );
        throw new BadRequestException(errorMessages);
      }

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
      console.error(
        'Error retrieving the nearest event:',
        error.message || error,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve the nearest event',
      );
    }
  }

  // Add this new validation method
  private validateEventDate(eventDate: string): void {
    const currentDate = new Date();
    const inputDate = new Date(eventDate);

    // Remove time portion for comparison
    currentDate.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < currentDate) {
      // Throw BadRequestException directly
      throw new BadRequestException('Event date must be in the future');
    }
  }

  async removeSpeakerFromEvent(eventId: string, speakerId: string): Promise<Events> {
    try {
      const updatedEvent = await this.eventModel.findByIdAndUpdate(
        eventId,
        {
          $pull: {
            speakers: { _id: new Types.ObjectId(speakerId) }
          }
        },
        { new: true }
      ).exec();

      if (!updatedEvent) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      return updatedEvent;
    } catch (error) {
      console.error('Error removing speaker from event:', error.message || error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove speaker from event');
    }
  }

  async removeAgendaFromEvent(eventId: string, agendaId: string): Promise<Events> {
    try {
      const updatedEvent = await this.eventModel.findByIdAndUpdate(
        eventId,
        {
          $pull: {
            agenda: { _id: new Types.ObjectId(agendaId) }
          }
        },
        { new: true }
      ).exec();

      if (!updatedEvent) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      return updatedEvent;
    } catch (error) {
      console.error('Error removing agenda from event:', error.message || error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove agenda from event');
    }
  }

  async getSpeakerById(eventId: string, speakerId: string): Promise<Speaker> {
    try {
      const event = await this.eventModel.findById(eventId).exec();
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      const speaker = event.speakers.find(
        (s) => s._id.toString() === speakerId
      );

      if (!speaker) {
        throw new NotFoundException(`Speaker with ID ${speakerId} not found in event`);
      }

      return speaker;
    } catch (error) {
      console.error('Error fetching speaker:', error.message || error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch speaker');
    }
  }

  async getAgendaById(eventId: string, agendaId: string): Promise<Agenda> {
    try {
      const event = await this.eventModel.findById(eventId).exec();
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      const agendaItem = event.agenda.find(
        (a) => a._id.toString() === agendaId
      );

      if (!agendaItem) {
        throw new NotFoundException(`Agenda item with ID ${agendaId} not found in event`);
      }

      return agendaItem;
    } catch (error) {
      console.error('Error fetching agenda item:', error.message || error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch agenda item');
    }
  }

  async purchaseEvent(id: string, purchaseDto: PurchaseEventDto, userId: string): Promise<string> {
    try {
      // Log the incoming purchaseDto for debugging
      console.log('Purchase DTO:', purchaseDto);
      console.log('Event ID:', id);

      // Generate a unique merchant reference number
      const merchantRefNum = this.generateMerchantRefNum(userId.toString());

      // Retrieve the event
      const event = await this.eventModel.findById(id).exec();
      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      // Check if the event is paid
      if (!event.isPaid) {
        throw new BadRequestException('This event is not marked as paid. Purchase cannot proceed.');
      }

      // Check if there are available seats
      // if (event.availableSeats <= 0) {
      //   throw new BadRequestException('No seats available for this event');
      // }

      // Determine the price based on the event
      const amount = event.price;

      // Create the charge request DTO
      const createChargeRequestDto = {
        merchantCode: '', // Ensure this is set in your environment
        merchantRefNum: merchantRefNum, // Ensure this is a primitive string
        customerMobile: purchaseDto.customerMobile,
        customerEmail: purchaseDto.customerEmail,
        customerName: purchaseDto.customerName,
        language: 'en-gb',
        chargeItems: [
          {
            itemId: event._id.toString(),
            description: event.eventName, // Use eventName instead of name
            price: amount,
            quantity: 1,
          },
        ],
        returnUrl: 'https://www.google.com/', // Your actual return URL
        paymentExpiry: 0, // Set payment expiry as needed
      };

      // Call Fawry service to create charge request
      const redirectUrl = await this.fawryService.createChargeRequest(createChargeRequestDto);

      // Log the redirect URL for debugging
      console.log('Redirect URL:', redirectUrl);

      // Ensure redirectUrl is a string
      if (typeof redirectUrl !== 'string') {
        throw new InternalServerErrorException('Invalid redirect URL returned from Fawry service');
      }

      // Return the redirect URL
      return redirectUrl; // Return the URL directly

    } catch (error) {
      // Handle specific errors
      console.log(error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof InternalServerErrorException) {
        throw new InternalServerErrorException('An error occurred while processing the payment request');
      } else {
        // Log unexpected errors
        console.error('Unexpected error:', error);
        throw new InternalServerErrorException('An unexpected error occurred');
      }
    }
  }

  private generateMerchantRefNum(userId: string): string {
    const uuid = uuidv4(); // Generate a UUID
    return `${userId}-${uuid}`; // Combine userId and UUID
  }
}
