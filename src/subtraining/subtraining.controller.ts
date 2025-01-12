import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, NotFoundException, BadRequestException, Put, InternalServerErrorException, UseGuards, Res } from '@nestjs/common';
import { SubtrainingService } from './subtraining.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSubTrainingDto } from './dto/create.subtraining.dto';
import { SubTrainingsPaginateDto } from './dto/get.sub.trainings.dto';
import { SubTrainingEntity } from './entities/subtraining.entity';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guards';
import { Roles } from '../auth/Roles.decorator';
import { Role } from '../user/common utils/Role.enum';
import { CreateOfferDto } from './dto/create-offer.dto';
import { TopicDto } from './dto/add.topic.dto';
import { PurchaseSubTrainingDto } from './dto/purchase-subtraining.dto';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('subTrainings')
@Controller('sub/training')
export class SubtrainingController {
  constructor(private readonly subtrainingService: SubtrainingService) {}


  @Post()
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.ADMIN)  
  @ApiOperation({ summary: 'Create a new sub-training' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new sub-summer training',
    type: CreateSubTrainingDto,
  })
  @UseInterceptors(FileInterceptor('image')) // Ensure 'image' matches the field name in your form-data
  async create(
    @Body() createSubTrainingDto: CreateSubTrainingDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException('Image file is required');
    }

    return await this.subtrainingService.create(createSubTrainingDto, image);

  }
  @Post(':id/offer')
  @ApiOperation({ summary: 'Add an offer to a sub-training' })
  async addOffer(
    @Param('id') id: string,
    @Body() createOfferDto: CreateOfferDto
  ) {
    return await this.subtrainingService.addOffer(id, createOfferDto);
  }

  @Delete(':id/offer')
  @ApiOperation({ summary: 'Remove an offer from a sub-training' })
  async removeOffer(@Param('id') id: string) {
    return await this.subtrainingService.removeOffer(id);
  }



  @Get('sorted/:id')
  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN) // Adjust roles as necessary
  @ApiOperation({ summary: 'Get all sub-trainings for a specific summer training ID' })
  @ApiResponse({ status: 200, description: 'List of sub-trainings', type: [SubTrainingEntity] })
  @ApiResponse({ status: 404, description: 'Summer training not found' })
  async getAllSubTrainingsForSummerTraining(
    @Param('id') summerTrainingId: string,
    @Query('page') page: number = 1, // Default to page 1
    @Query('limit') limit: number = 10 // Default to limit 10
  ): Promise<{ data: SubTrainingEntity[], total: number }> {
    return this.subtrainingService.getAllSubTrainingsForSummerTraining(summerTrainingId, page, limit);
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
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.ADMIN)  
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
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.ADMIN)  
  async deleteSubTraining(@Param('id') id: string): Promise<void> {
    await this.subtrainingService.deleteSubTraining(id);
  }

  @Post(':id/topic')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add a topic to a sub-training' })
  @ApiResponse({ status: 201, description: 'Topic added successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Sub-training not found.' })
  async addTopic(
    @Param('id') subtrainingId: string,
    @Body() topicDto: TopicDto,
  ) {
    return await this.subtrainingService.addTopicToEvent(subtrainingId, topicDto);
  }

  @Delete(':id/topic/:topicId')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remove a topic from a sub-training' })
  @ApiResponse({ status: 200, description: 'Topic removed successfully.' })
  @ApiResponse({ status: 404, description: 'Sub-training or topic not found.' })
  async removeTopic(
    @Param('id') subtrainingId: string,
    @Param('topicId') topicId: string,
  ) {
    return await this.subtrainingService.removeTopicFromSubTraining(subtrainingId, topicId);
  }

  @Get(':id/topic/:topicId')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a topic by ID' })
  @ApiResponse({ status: 200, description: 'Topic found.' })
  @ApiResponse({ status: 404, description: 'Sub-training or topic not found.' })
  async getTopic(
    @Param('id') subtrainingId: string,
    @Param('topicId') topicId: string,
  ) {
    return await this.subtrainingService.getTopicById(subtrainingId, topicId);
  }

  @Get(':id/topics')
  @ApiOperation({ summary: 'Get all topics for a specific sub-training ID' })
  @ApiResponse({ status: 200, description: 'List of topics', type: [TopicDto] })
  @ApiResponse({ status: 404, description: 'Sub-training not found' })
  async getTopicsBySubTrainingId(@Param('id') subTrainingId: string): Promise<TopicDto[]> {
    return this.subtrainingService.getTopicsBySubTrainingId(subTrainingId);
  }

  @Post(':id/purchase')
  async purchaseSubTraining(
    @Param('id') id: string,
    @Body() purchaseDto: PurchaseSubTrainingDto,
    @Res() res: Response
  ): Promise<any> {
    const redirectUrl = await this.subtrainingService.purchaseSubTraining(id, purchaseDto);
    
    return res.redirect(redirectUrl);
  }
}
