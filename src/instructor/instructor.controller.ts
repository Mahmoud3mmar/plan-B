import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { CreateInstructorDto } from './dto/create.instructor.dto';
import { UpdateInstructorDto } from './dto/update.instructor.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Instructor } from './entities/instructor.entity';

@ApiTags('instructor')
@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new instructor' })
  @ApiResponse({ status: 201, description: 'The instructor has been successfully created.', type: Instructor })
  async create(@Body() createInstructorDto: CreateInstructorDto): Promise<Instructor> {
    return this.instructorService.create(createInstructorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all instructors with pagination' })
  @ApiResponse({ status: 200, description: 'List of instructors with pagination', type: [Instructor] })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ data: Instructor[], total: number }> {
    return this.instructorService.findAll(page, limit);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get a specific instructor by ID' })
  @ApiResponse({ status: 200, description: 'The instructor details', type: Instructor })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  async findOne(@Param('id') id: string): Promise<Instructor> {
    return this.instructorService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a specific instructor by ID' })
  @ApiResponse({ status: 200, description: 'The instructor has been successfully updated.', type: Instructor })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  async update(@Param('id') id: string, @Body() updateInstructorDto: UpdateInstructorDto): Promise<Instructor> {
    return this.instructorService.update(id, updateInstructorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific instructor by ID' })
  @ApiResponse({ status: 204, description: 'The instructor has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.instructorService.remove(id);
  }
}