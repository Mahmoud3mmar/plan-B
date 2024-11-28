import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Put,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  InternalServerErrorException,
  Query,
  NotFoundException,
  UsePipes,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create.event.dto';
import { UpdateEventDto } from './dto/update.event.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Events } from './entities/event.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PaginateDto } from './dto/get.events.dto';
import { ObjectIdValidationPipe } from './pipes/object-id-validation.pipe';
import { AddSpeakerDto } from './dto/add-speakers.dto';
import { AgendaDto } from './dto/agenda.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Event details and image',
    type: CreateEventDto,
    // Example for the request body with one image
    examples: {
      'application/json': {
        value: {
          eventName: 'Sample Event',
          eventDate: '2024-10-10',
          description: 'Event Description',
          location: 'Egypt, Giza',
          speakerName: 'Speaker Name',
          image: 'Path to image file', // Single image file
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: Events,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    schema: { example: { message: 'Image is required' } },
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseInterceptors(FileInterceptor('image')) // Changed to handle one image
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() image: Express.Multer.File, // Changed to handle one image
  ): Promise<Events> {
    // Check if an image was provided
    if (!image) {
      throw new BadRequestException('Image is required');
    }

    return this.eventsService.createEvent(createEventDto, image);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Get('sorted')
  @ApiOperation({ summary: 'Get all events with pagination and sorting' })
  @ApiResponse({ status: 200, description: 'List of events', type: [Event] })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of events per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Field to sort by',
    example: 'eventDate',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Sort order (asc/desc)',
    example: 'asc',
  })
  async getAllEvents(@Query() paginateDto: PaginateDto): Promise<any> {
    return this.eventsService.getAllEvents(paginateDto);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Get('byId/:eventId')
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiResponse({ status: 200, description: 'Event found', type: Events })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 500, description: 'Failed to fetch event' })
  async getEventById(@Param('eventId') eventId: string): Promise<Events> {
    return this.eventsService.getEventById(eventId);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Put(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: Event,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 500, description: 'Failed to update event' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image')) // Accept a single file
  async updateEvent(
    @Param('id') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() thumbnailImageFile: Express.Multer.File, // Accept only one thumbnail image file
  ): Promise<Events> {
    // Check if a thumbnail image file was provided
    if (!thumbnailImageFile) {
      throw new BadRequestException('Thumbnail image is required');
    }

    return this.eventsService.updateEvent(
      eventId,
      updateEventDto,
      thumbnailImageFile,
    );
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Delete(':eventId')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 500, description: 'Failed to delete event' })
  async deleteEvent(@Param('eventId') eventId: string): Promise<void> {
    return this.eventsService.deleteEvent(eventId);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Get('nearest')
  @ApiOperation({ summary: 'Get the nearest upcoming event' })
  @ApiResponse({
    status: 200,
    description: 'Nearest upcoming event',
    type: Events,
  })
  @ApiResponse({ status: 404, description: 'No upcoming events found' })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve the nearest event',
  })
  async getNearestEvent(): Promise<Events> {
    try {
      return await this.eventsService.getNearestEvent();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }
  @Post(':eventId/speaker')
  @ApiOperation({ summary: 'Add a speaker to an event' })
  @ApiResponse({ status: 200, description: 'Speaker added successfully', type: Events })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Failed to add speaker to event' })
  @UseInterceptors(FileInterceptor('image')) // Use FileInterceptor to handle image upload
  async addSpeaker(
    @Param('eventId') eventId: string,
    @Body() speaker: AddSpeakerDto,
    @UploadedFile() image: Express.Multer.File // Accept the uploaded image
  ): Promise<Events> {
    // Check if an image was provided
    if (!image) {
      throw new BadRequestException('Image is required');
    }

    // Call the service method to add the speaker
    return this.eventsService.addSpeakerToEvent(eventId, speaker, image);
  }

  @Post(':eventId/agenda')
  @ApiOperation({ summary: 'Add an agenda item to an event' })
  @ApiResponse({ status: 200, description: 'Agenda item added successfully', type: Events })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Failed to add agenda to event' })
  async addAgenda(
    @Param('eventId') eventId: string,
    @Body() agendaDto: AgendaDto
  ): Promise<Events> {
    return this.eventsService.addAgendaToEvent(eventId, agendaDto);
  }

}
