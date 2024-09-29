import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, NotFoundException } from '@nestjs/common';
import { CurriculumBlockService } from './curriculum.block.service';
import { CreateCurriculumBlockDto } from './dto/create.curriculum.block.dto';
import { UpdateCurriculumBlockDto } from './dto/update-curriculum-block.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurriculumBlock } from './entities/curriculum.block.entity';


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
}
