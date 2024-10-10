import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, NotFoundException, BadRequestException, Put, InternalServerErrorException } from '@nestjs/common';
import { SubtrainingService } from './subtraining.service';
import { ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSubTrainingDto } from './dto/create.subtraining.dto';
import { SubTrainingsPaginateDto } from './dto/get.sub.trainings.dto';
import { SubTrainingEntity } from './entities/subtraining.entity';

@ApiTags('subTrainings')
@Controller('sub/training')
export class SubtrainingController {
  constructor(private readonly subtrainingService: SubtrainingService) {}


  @Post()
  @ApiOperation({ summary: 'Create a new sub-training' })
  @ApiResponse({ status: 201, description: 'The sub-training has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @UseInterceptors(FileInterceptor('image')) // Ensure 'image' matches the field name in your form-data
  async create(
    @Body() createSubTrainingDto: CreateSubTrainingDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException('Image file is required');
    }

    // Log the received image for debugging
    console.log('Received image:', image);

    try {
      return await this.subtrainingService.create(createSubTrainingDto, image);
    } catch (error) {
      console.error('Error creating sub-training:', error.message || error);
      throw new InternalServerErrorException('Failed to create sub-training');
    }
  }



  @Get('sorted')
  async getAll(@Query() paginateDto: SubTrainingsPaginateDto) {
    return this.subtrainingService.getAllSubTrainings(paginateDto);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The found sub-training',
    type: SubTrainingEntity,
  })
  @ApiResponse({ status: 404, description: 'Sub-training not found' })
  async getSubTrainingById(@Param('id') id: string): Promise<SubTrainingEntity> {
    try {
      return await this.subtrainingService.getSubTrainingById(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }


  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({
    status: 200,
    description: 'The updated sub-training',
    type: SubTrainingEntity,
  })
  @ApiResponse({ status: 404, description: 'Sub-training not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async updateSubTraining(
    @Param('id') id: string,
    @Body() updateSubTrainingDto: Partial<CreateSubTrainingDto>,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<SubTrainingEntity> {
    try {
      return await this.subtrainingService.update(id, updateSubTrainingDto, image);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }


  @Delete(':id')
  async deleteSubTraining(@Param('id') id: string): Promise<void> {
    await this.subtrainingService.deleteSubTraining(id);
  }
}
