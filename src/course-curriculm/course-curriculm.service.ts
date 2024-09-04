import { Injectable } from '@nestjs/common';
import { CreateCourseCurriculmDto } from './dto/create-course-curriculm.dto';
import { UpdateCourseCurriculmDto } from './dto/update-course-curriculm.dto';

@Injectable()
export class CourseCurriculmService {
  create(createCourseCurriculmDto: CreateCourseCurriculmDto) {
    return 'This action adds a new courseCurriculm';
  }

  findAll() {
    return `This action returns all courseCurriculm`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseCurriculm`;
  }

  update(id: number, updateCourseCurriculmDto: UpdateCourseCurriculmDto) {
    return `This action updates a #${id} courseCurriculm`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseCurriculm`;
  }
}
