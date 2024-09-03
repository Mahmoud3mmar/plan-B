import { Injectable } from '@nestjs/common';
import { CreateSummertrainingDto } from './dto/create-summertraining.dto';
import { UpdateSummertrainingDto } from './dto/update-summertraining.dto';

@Injectable()
export class SummertrainingService {
  create(createSummertrainingDto: CreateSummertrainingDto) {
    return 'This action adds a new summertraining';
  }

  findAll() {
    return `This action returns all summertraining`;
  }

  findOne(id: number) {
    return `This action returns a #${id} summertraining`;
  }

  update(id: number, updateSummertrainingDto: UpdateSummertrainingDto) {
    return `This action updates a #${id} summertraining`;
  }

  remove(id: number) {
    return `This action removes a #${id} summertraining`;
  }
}
