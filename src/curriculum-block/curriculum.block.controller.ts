import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, NotFoundException, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CurriculumBlockService } from './curriculum.block.service';
import { CreateCurriculumBlockDto } from './dto/create.curriculum.block.dto';
import { UpdateCurriculumBlockDto } from './dto/update-curriculum-block.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CurriculumBlock } from './entities/curriculum.block.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';

@ApiBearerAuth()
@ApiTags('curriculum-block')
@Controller('curriculum/block')
export class CurriculumBlockController {
  constructor(private readonly curriculumBlockService: CurriculumBlockService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new curriculum block' })
  @ApiResponse({ status: 201, description: 'The curriculum block has been successfully created.' })
  @ApiResponse({ status: 404, description: 'Course or Curriculum not found.' })
  async createCurriculumBlock(
    @Body() createCurriculumBlockDto: CreateCurriculumBlockDto,
  ): Promise<CurriculumBlock> {
    try {
      return await this.curriculumBlockService.createCurriculumBlock(createCurriculumBlockDto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create curriculum block');
    }
  }

  // @Post(':curriculumBlockId/upload-pdf')
  // @UseGuards(AccessTokenGuard)
  // @UseInterceptors(FileInterceptor('pdf'))
  // @ApiOperation({ summary: 'Upload a PDF for a curriculum block' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Successfully uploaded PDF.',
  //   type: CurriculumBlock,
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'CurriculumBlock not found.',
  // })
  // async uploadPdf(
  //   @Param('curriculumBlockId') curriculumBlockId: string,
  //   @UploadedFile() pdf: Express.Multer.File,
  // ): Promise<CurriculumBlock> {
  //   if (!pdf) {
  //     throw new BadRequestException('PDF file is required.');
  //   }
  //   return this.curriculumBlockService.uploadPdf(curriculumBlockId, pdf);
  // }

  // @Post('upload/pdf/:curriculumBlockId')
  // @UseGuards(AccessTokenGuard) // Ensure the user is authenticated
  // @UseInterceptors(FileInterceptor('pdf')) // Expecting the file to be sent with the key 'pdf'
  // @ApiOperation({ summary: 'Upload a PDF for a specific curriculum block' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Successfully uploaded PDF.',
  //   type: String, // Assuming the response is a URL string
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Bad Request - PDF file is required.',
  // })
  // @ApiConsumes('multipart/form-data') // Specify that this endpoint consumes multipart/form-data
  // async uploadPdf(
  //   @Param('curriculumBlockId') curriculumBlockId: string,
  //   @UploadedFile() pdf: Express.Multer.File,
  // ): Promise<{ message: string; url: string }> {
  //   if (!pdf) {
  //     throw new BadRequestException('PDF file is required.');
  //   }
  //   const url = await this.curriculumBlockService.uploadCurriculumPdf(curriculumBlockId, pdf);
  //   return {
  //     message: 'PDF uploaded successfully',
  //     url,
  //   };
  // }
  @Post('pdf/:curriculumBlockId')
  @UseGuards(AccessTokenGuard) // Ensure the user is authenticated
  @UseInterceptors(FileInterceptor('pdf')) // Expecting the file to be sent with the key 'pdf'
  @ApiOperation({ summary: 'Upload a PDF for a specific curriculum block' })
  @ApiResponse({
    status: 200,
    description: 'Successfully uploaded PDF.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'PDF uploaded successfully' },
        url: { type: 'string', example: 'https://res.cloudinary.com/example.pdf' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - PDF file is required.',
  })
  @ApiConsumes('multipart/form-data') // Specify that this endpoint consumes multipart/form-data
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pdf: {
          type: 'string',
          format: 'binary', // Indicates that this is a file upload
        },
      },
    },
  })
  async uploadPdf(
    @Param('curriculumBlockId') curriculumBlockId: string,
    @UploadedFile() pdf: Express.Multer.File,
  ): Promise<{ message: string; url: string }> {
    if (!pdf) {
      throw new BadRequestException('PDF file is required.');
    }
    const url = await this.curriculumBlockService.uploadCurriculumPdf(curriculumBlockId, pdf);
    return {
      message: 'PDF uploaded successfully',
      url,
    };
  }

  // Endpoint to get the PDF URL for a specific curriculum block
  @Get('pdf/:curriculumBlockId')
  @UseGuards(AccessTokenGuard) // Ensure the user is authenticated
  @ApiOperation({ summary: 'Get the PDF URL for a specific curriculum block' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved PDF URL.',
    type: String,
  })
  @ApiResponse({
    status: 404,
    description: 'CurriculumBlock not found.',
  })
  async getPdf(
    @Param('curriculumBlockId') curriculumBlockId: string,
  ): Promise<{ url: string }> {
    const url = await this.curriculumBlockService.getCurriculumPdf(curriculumBlockId);
    return { url };
  }

  // Endpoint to delete the PDF for a specific curriculum block
  @Delete('pdf/:curriculumBlockId')
  @UseGuards(AccessTokenGuard) // Ensure the user is authenticated
  @ApiOperation({ summary: 'Delete the PDF for a specific curriculum block' })
  @ApiResponse({
    status: 204,
    description: 'Successfully deleted PDF.',
  })
  @ApiResponse({
    status: 404,
    description: 'CurriculumBlock not found.',
  })
  async deletePdf(
    @Param('curriculumBlockId') curriculumBlockId: string,
  ): Promise<void> {
    await this.curriculumBlockService.deleteCurriculumPdf(curriculumBlockId);
  }
}
