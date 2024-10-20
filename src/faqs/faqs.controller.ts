import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create.faq.dto';
import { UpdateFaqDto } from './dto/update.faq.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Faq } from './entities/faq.entity';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { Types } from 'mongoose';

@ApiTags('FAQs')
@Controller('faqs')
export class FaqsController {
  constructor(private readonly FaqsService: FaqsService) {}

  @Post(':courseId')
  // @UseGuards(AccessTokenGuard)

  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiParam({
    name: 'courseId',
    description: 'The ID of the course related to the FAQ',
    type: String,
  })
  async create(
    @Body() createFaqDto: CreateFaqDto,
    @Param('courseId') courseId:string,
  ): Promise<Faq> {
    return this.FaqsService.create(createFaqDto, courseId);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Get()
  @ApiOperation({ summary: 'Retrieve all FAQs with pagination and optional courseId filtering' })
  @ApiResponse({ status: 200, description: 'List of FAQs with pagination.', type: [Faq] })
  @ApiResponse({ status: 404, description: 'No FAQs found.' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('courseId') courseId?: string, // Optional courseId query parameter
  ): Promise<{ data: Faq[], total: number }> {
    return this.FaqsService.findAll(page, limit, courseId);
  }
  
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Get(':id')
  // @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Retrieve a specific FAQ by ID' })
  @ApiResponse({ status: 200, description: 'The FAQ details.', type: Faq })
  @ApiResponse({ status: 404, description: 'FAQ not found.' })
  async findOne(@Param('id') id: string): Promise<Faq> {
    return this.FaqsService.findOne(id);
  }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Put(':id')
  // @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update an existing FAQ by ID' })
  @ApiResponse({ status: 200, description: 'The updated FAQ.', type: Faq })
  @ApiResponse({ status: 404, description: 'FAQ not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async update(
    @Param('id') id: string,
    @Body() updateFaqDto: UpdateFaqDto,
  ): Promise<Faq> {
    return this.FaqsService.update(id, updateFaqDto);
  }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Delete(':faqId')
  // @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Delete an FAQ by ID' })
  @ApiResponse({ status: 204, description: 'The FAQ has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'FAQ not found.' })
  async remove(@Param('faqId') faqId: string): Promise<string> {
    return this.FaqsService.remove(faqId);
  }

}