import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create.faq.dto';
import { UpdateFaqDto } from './dto/update.faq.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Faq } from './entities/faq.entity';

@ApiTags('faqs')
@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiResponse({ status: 201, description: 'The FAQ has been successfully created.', type: Faq })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() createFaqDto: CreateFaqDto): Promise<Faq> {
    return this.faqsService.create(createFaqDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all FAQs with pagination' })
  @ApiResponse({ status: 200, description: 'List of FAQs with pagination.', type: [Faq] })
  @ApiResponse({ status: 404, description: 'No FAQs found.' })
  async findAll(
    @Query('page') page = 1, 
    @Query('limit') limit = 10
  ): Promise<{ data: Faq[], total: number }> {
    return this.faqsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific FAQ by ID' })
  @ApiResponse({ status: 200, description: 'The FAQ details.', type: Faq })
  @ApiResponse({ status: 404, description: 'FAQ not found.' })
  async findOne(@Param('id') id: string): Promise<Faq> {
    return this.faqsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing FAQ by ID' })
  @ApiResponse({ status: 200, description: 'The updated FAQ.', type: Faq })
  @ApiResponse({ status: 404, description: 'FAQ not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async update(
    @Param('id') id: string,
    @Body() updateFaqDto: UpdateFaqDto,
  ): Promise<Faq> {
    return this.faqsService.update(id, updateFaqDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an FAQ by ID' })
  @ApiResponse({ status: 204, description: 'The FAQ has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'FAQ not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.faqsService.remove(id);
  }
}