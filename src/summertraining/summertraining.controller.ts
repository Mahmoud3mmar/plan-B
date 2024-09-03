import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SummertrainingService } from './summertraining.service';
import { CreateSummertrainingDto } from './dto/create-summertraining.dto';
import { UpdateSummertrainingDto } from './dto/update-summertraining.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('summertraining')
@Controller('summertraining')
export class SummertrainingController {
  constructor(private readonly summertrainingService: SummertrainingService) {}

  @Post()
  create(@Body() createSummertrainingDto: CreateSummertrainingDto) {
    return this.summertrainingService.create(createSummertrainingDto);
  }

  @Get()
  findAll() {
    return this.summertrainingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.summertrainingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSummertrainingDto: UpdateSummertrainingDto) {
    return this.summertrainingService.update(+id, updateSummertrainingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.summertrainingService.remove(+id);
  }
}
