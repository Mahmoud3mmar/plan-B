import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query, BadRequestException, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import { VedioService } from './vedio.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Video } from './entities/vedio.entity';
import { CreateVideoDto } from './dto/create.vedio.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetVideosDto } from './dto/get.vedio.dto';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const multerOptions: MulterOptions = {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only video files are allowed'), false);
    }
  },
};
@ApiTags('vedios')
@Controller('vedio')
export class VedioController {
  constructor(private readonly vedioService: VedioService) {}

  // @Post('upload/:courseId/:curriculumBlockId')
  // // @UseInterceptors(FileInterceptor('video'))
  // async uploadVideo(
  //   @Param('courseId') courseId: string,
  //   @Param('curriculumBlockId') curriculumBlockId: string,
  //   // @UploadedFile() video: Express.Multer.File,
  //   @Body() createVideoDto: CreateVideoDto
  // ) {
  //   return await this.vedioService.createVideo(createVideoDto, courseId, curriculumBlockId);
  // }
  // @Post('upload/:courseId/:curriculumBlockId')
  // @UseInterceptors(FileInterceptor('video', multerOptions))
  // async uploadVideo(
  //   @Param('courseId') courseId: string,
  //   @Param('curriculumBlockId') curriculumBlockId: string,
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() createVideoDto: CreateVideoDto,
  // ) {
  //   return await this.vedioService.createVideo(
  //     createVideoDto,
  //     courseId,
  //     curriculumBlockId,
  //     file,
  //   );
  // }
  @Post('upload/:curriculumBlockId')
  @UseInterceptors(FileInterceptor('vedio'))
  async uploadVideo(
    @Param('curriculumBlockId') curriculumBlockId: string,
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Video> {
    
      return await this.vedioService.createVideowithoutCourseId(
        createVideoDto,
        curriculumBlockId,
        file,
      );
    
    
  }
  @Get('sorted')
  @ApiQuery({ name: 'courseId', type: String, required: true, example: '66e1a62c3eae57948828541f' })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiQuery({ name: 'sortBy', type: String, required: false, example: 'uploadDate' })
  @ApiQuery({ name: 'sortOrder', type: String, required: false, example: 'desc' })
  @ApiResponse({ status: 200, description: 'List of videos for the course.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async getVideos(
    @Query() query: GetVideosDto
  ): Promise<any> {
    try {
      const { courseId, page = 1, limit = 10, sortBy = 'uploadDate', sortOrder = 'desc' } = query;

      // Validate page and limit
      if (page < 1 || !Number.isInteger(page)) {
        throw new BadRequestException('Page must be an integer greater than or equal to 1');
      }
      if (limit < 1 || !Number.isInteger(limit)) {
        throw new BadRequestException('Limit must be an integer greater than or equal to 1');
      }

      // Validate sortOrder
      const validSortOrders = ['asc', 'desc'];
      if (!validSortOrders.includes(sortOrder)) {
        throw new BadRequestException('SortOrder must be either "asc" or "desc"');
      }

      // Call the service method
      const result = await this.vedioService.getVideosForCourse(courseId, page, limit, sortBy, sortOrder);

      return result;
    } catch (error) {
      // Handle errors and send appropriate response
      console.error('Error retrieving videos:', error.message || error);
      throw new InternalServerErrorException('Failed to retrieve videos');
    }
  }


  @Delete(':videoId')
  @ApiResponse({ status: 200, description: 'Video successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Video not found.' })
  @ApiResponse({ status: 500, description: 'Failed to delete video.' })
  async deleteVideo(
    @Param('videoId') videoId: string,
    @Body('courseId') courseId: string
  ): Promise<void> {
    await this.vedioService.deleteVideo(videoId, courseId);

  }
  @Get('presigned/url')
  async getPresignedUrl(
    @Query('fileName') fileName: string,
    @Query('fileType') fileType: string,
  ) {
    return await this.vedioService.generatePresignedUrl(fileName, fileType);
  
  }

  @Get(':id')
  async getVideo(@Param('id') id: string): Promise<Video> {
    return this.vedioService.getVideoById(id);
  }

}