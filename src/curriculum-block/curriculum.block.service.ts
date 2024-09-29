import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCurriculumBlockDto } from './dto/create.curriculum.block.dto';
import { UpdateCurriculumBlockDto } from './dto/update-curriculum-block.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CurriculumBlock } from './entities/curriculum.block.entity';
import { Model } from 'mongoose';
import { CourseCurriculum } from 'src/course-curriculm/entities/course-curriculm.entity';
import { Course } from 'src/course/entities/course.entity';
import { Video } from 'src/vedio/entities/vedio.entity';

@Injectable()
export class CurriculumBlockService {
  constructor(
    @InjectModel(CurriculumBlock.name) private curriculumBlockModel: Model<CurriculumBlock>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(CourseCurriculum.name) private curriculumModel: Model<CourseCurriculum>,
  ) {}

  // Function to create a curriculum block and initialize with empty videos
  async createCurriculumBlock(createCurriculumBlockDto: CreateCurriculumBlockDto): Promise<CurriculumBlock> {
    const { courseId, ...blockData } = createCurriculumBlockDto;
    console.log(courseId)
    // Find the Course by ID
    const course = await this.courseModel.findById(courseId).populate('courseCurriculum');
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Get the CourseCurriculum from the Course
    const courseCurriculum = await this.curriculumModel.findById(course.courseCurriculum);
    if (!courseCurriculum) {
      throw new NotFoundException(`CourseCurriculum for Course ID ${courseId} not found`);
    }

    // Create a new CurriculumBlock with an empty videos array
    const newBlock = new this.curriculumBlockModel({
      ...blockData,
      videos: [], // Initialize with an empty array
      courseCurriculum: courseCurriculum.id,
    });

    await newBlock.save();

    // Attach the block to the CourseCurriculum
    courseCurriculum.CurriculumBlocks.push(newBlock.id);
    await courseCurriculum.save();

    return newBlock;
  }
}