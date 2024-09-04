import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SummertrainingService } from './summertraining.service';
import { UpdateSummertrainingDto } from './dto/update.summertraining.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSummerTrainingDto } from './dto/create.summertraining.dto';
import { SummerTraining } from './entities/summertraining.entity';

@ApiTags('summertraining')
@Controller('summertraining')
export class SummertrainingController {
  constructor(private readonly summertrainingService: SummertrainingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new summer training' })
  @ApiResponse({ status: 201, description: 'The summer training has been successfully created.', type: SummerTraining })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createDto: CreateSummerTrainingDto): Promise<SummerTraining> {
    return this.summertrainingService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all summer trainings with pagination' })
  @ApiQuery({ name: 'page', type: Number, description: 'Page number for pagination', required: false })
  @ApiQuery({ name: 'limit', type: Number, description: 'Number of items per page', required: false })
  @ApiResponse({ status: 200, description: 'List of summer trainings with pagination.', type: [SummerTraining] })
  @ApiResponse({ status: 404, description: 'No summer trainings found.' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ data: SummerTraining[], total: number }> {
    return this.summertrainingService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific summer training by ID' })
  @ApiResponse({ status: 200, description: 'The summer training details.', type: SummerTraining })
  @ApiResponse({ status: 404, description: 'Summer training not found.' })
  async findOne(@Param('id') id: string): Promise<SummerTraining> {
    return this.summertrainingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific summer training by ID' })
  @ApiResponse({ status: 200, description: 'The updated summer training details.', type: SummerTraining })
  @ApiResponse({ status: 404, description: 'Summer training not found.' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateSummertrainingDto): Promise<SummerTraining> {
    return this.summertrainingService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific summer training by ID' })
  @ApiResponse({ status: 204, description: 'The summer training has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Summer training not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.summertrainingService.remove(id);
  }
}