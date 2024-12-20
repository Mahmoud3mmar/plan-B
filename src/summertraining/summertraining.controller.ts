import { Controller,  Request,
  Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, Put, HttpStatus, HttpCode, UseGuards, BadRequestException } from '@nestjs/common';
import { SummertrainingService } from './summertraining.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSummerTrainingDto } from './dto/create.summertraining.dto';
import { SummerTraining } from './entities/summertraining.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetSummerTrainingDto } from './dto/get.summer.training.dto';
import { UpdateSummerTrainingDto } from './dto/update.summertraining.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guards';
import { Roles } from '../auth/Roles.decorator';
import { Role } from '../user/common utils/Role.enum';
@ApiBearerAuth()
@ApiTags('summertraining')
@Controller('summer/training')
export class SummertrainingController {
  constructor(private readonly summertrainingService: SummertrainingService) {}

  @Post()
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.ADMIN)  
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new summer training',
    type: CreateSummerTrainingDto,
  })
  @UseInterceptors(FileInterceptor('image')) // Use Cloudinary Multer
  async create(
    @Request() req,
    @Body() createSummerTrainingDto: CreateSummerTrainingDto,
    @UploadedFile() image: Express.Multer.File, // Handle uploaded file
  ) {
    if (!image) {
      throw new BadRequestException('Image file is required');
    }
    const userId = req.user; // Assuming `sub` contains the user ID
    console.log(userId)
    // // Upload the file to Cloudinary
    // const uploadResult = await this.cloudinaryService.uploadImage(file);
    // if (!uploadResult || !uploadResult.secure_url) {
    //   throw new BadRequestException('Image upload failed');
    // }

    // Call the service to create summer training with Cloudinary image URL
    return await this.summertrainingService.create(createSummerTrainingDto, image);
  }

  @Get('sorted')
  async getSummerTraining(
    @Query() query: GetSummerTrainingDto,
  ) {
    return this.summertrainingService.getAllSummerTraining(query);
  }

  @Get(':id')
  
  @ApiOperation({ summary: 'Get a summer training by ID' })
  @ApiResponse({
    status: 200,
    description: 'The summer training record',
    type: SummerTraining,
  })
  @ApiResponse({
    status: 404,
    description: 'Summer training not found',
  })
  async getSummerTrainingById(@Param('id') id: string): Promise<SummerTraining> {
    return this.summertrainingService.getSummerTrainingById(id);
  }
 
  @Put(':id')
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.ADMIN)  
  @UseInterceptors(FileInterceptor('image')) // Specify the name of the field for the file
  async update(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File, // Handle uploaded file
    @Body() updateDto: UpdateSummerTrainingDto,
  ): Promise<SummerTraining> {
    

    return this.summertrainingService.updateSummerTraining(id, updateDto,image);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.ADMIN)  
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a summer training and its related sub-trainings' })
  @ApiResponse({ status: 204, description: 'Summer training deleted successfully' })
  async deleteSummerTraining(@Param('id') id: string): Promise<void> {
    await this.summertrainingService.deleteSummerTraining(id);
  }
}