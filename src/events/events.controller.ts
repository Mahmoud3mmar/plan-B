import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException, InternalServerErrorException, Query, NotFoundException, UsePipes } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create.event.dto';
import { UpdateEventDto } from './dto/update.event.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Events } from './entities/event.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PaginateDto } from './dto/get.events.dto';
import { ObjectIdValidationPipe } from './pipes/object-id-validation.pipe';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Event details and images',
    type: CreateEventDto,
    // Additional properties to describe file uploads
    examples: {
      'application/json': {
        value: {
          eventName: 'Sample Event',
          eventDate: '2024-10-10',
          description: 'Event Description',
          location: 'Egypt, Giza',
          speakerName: 'Speaker Name',
          speakerImage: 'Path to speaker image file',
          thumbnailImage: 'Path to thumbnail image file',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Event created successfully', type: Events })
  @ApiResponse({ status: 400, description: 'Bad Request', schema: { example: { message: 'Two files are required' } } })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseInterceptors(FilesInterceptor('image', 2))
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @UploadedFiles() images: Express.Multer.File[]
  ): Promise<Events> {
    if (images.length !== 2) {
      throw new BadRequestException('Two files are required');
    }

    const [speakerImageFile, thumbnailImageFile] = images;

    return this.eventsService.createEvent(createEventDto, speakerImageFile, thumbnailImageFile);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Get('sorted')
  @ApiOperation({ summary: 'Get all events with pagination and sorting' })
  @ApiResponse({ status: 200, description: 'List of events', type: [Event] })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of events per page', example: 10 })
  @ApiQuery({ name: 'sort', required: false, description: 'Field to sort by', example: 'eventDate' })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order (asc/desc)', example: 'asc' })
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
  @ApiResponse({ status: 200, description: 'Event updated successfully', type: Event })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 500, description: 'Failed to update event' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('image', 2))
  async updateEvent(
    @Param('id') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<Events> {
    let speakerImageFile: Express.Multer.File | undefined;
    let thumbnailImageFile: Express.Multer.File | undefined;

    if (files.length > 2) {
      throw new BadRequestException('Only two files are allowed: speakerImage and thumbnailImage');
    }

    if (files.length > 0) {
      if (files[0].fieldname === 'speakerImage') {
        speakerImageFile = files[0];
      } else if (files[0].fieldname === 'thumbnailImage') {
        thumbnailImageFile = files[0];
      }
    }

    if (files.length > 1) {
      if (files[1].fieldname === 'speakerImage') {
        speakerImageFile = files[1];
      } else if (files[1].fieldname === 'thumbnailImage') {
        thumbnailImageFile = files[1];
      }
    }

    return this.eventsService.updateEvent(eventId, updateEventDto, speakerImageFile, thumbnailImageFile);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 500, description: 'Failed to delete event' })
  async deleteEvent(@Param('id') eventId: string): Promise<void> {
    return this.eventsService.deleteEvent(eventId);
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@Get('nearest')
@ApiOperation({ summary: 'Get the nearest upcoming event' })
@ApiResponse({ status: 200, description: 'Nearest upcoming event', type: Events })
@ApiResponse({ status: 404, description: 'No upcoming events found' })
@ApiResponse({ status: 500, description: 'Failed to retrieve the nearest event' })
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
}