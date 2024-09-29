import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CourseCurriculum } from './entities/course-curriculm.entity';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CurriculumBlock } from '../curriculum-block/entities/curriculum.block.entity';
import { Course } from '../course/entities/course.entity';
import { GetCourseCurriculumDto } from './dto/get.course.curriculum.dto';

@Injectable()
export class CourseCurriculmService {
  constructor(
    @InjectModel(CourseCurriculum.name)private readonly courseCurriculumModel: Model<CourseCurriculum>,
    @InjectModel(Course.name)private readonly courseModel: Model<Course>,

  ) {}
  async getCourseCurriculum(
    courseId: string,
    paginationDto: GetCourseCurriculumDto
  ): Promise<{ curriculum: CourseCurriculum; total: number; totalPages: number }> {
    // Validate courseId
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException(`Invalid course ID format: ${courseId}`);
    }

    try {
      // Step 1: Find the course by ID to get the curriculum ID
      const course = await this.courseModel.findById(courseId).exec();

      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found.`);
      }

      // Step 2: Extract the curriculum ID
      const curriculumId = course.courseCurriculum[0]; // Assuming there's only one curriculum associated

      if (!curriculumId) {
        throw new NotFoundException(`No course curriculum found for course ID ${courseId}.`);
      }

      // Step 3: Find the curriculum by ID and populate its blocks with pagination
      const limit = paginationDto.limit || 10; // Default limit to 10 if not provided
      const page = paginationDto.page || 1; // Default page to 1 if not provided

      const curriculum = await this.courseCurriculumModel
        .findById(curriculumId)
        .populate({
          path: 'CurriculumBlocks',
          options: {
            limit: limit,
            skip: (page - 1) * limit, // Calculate the number of items to skip based on page number
          },
          populate: {
            path: 'videos', // Assuming videos are a field in CurriculumBlock
            model: 'Video', // Make sure this matches your video model name
          },
        })
        .exec();

      if (!curriculum) {
        throw new NotFoundException(`Curriculum with ID ${curriculumId} not found.`);
      }

      // Calculate total count of blocks for pagination
      const totalBlocks = await this.courseCurriculumModel
        .findById(curriculumId)
        .populate('CurriculumBlocks')
        .then((curr) => curr.CurriculumBlocks.length); // Get total number of blocks

      const totalPages = Math.ceil(totalBlocks / limit);

      // Return the curriculum with its blocks and pagination info
      return {
        curriculum,
        total: totalBlocks,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching course curriculum:', error);
      throw new InternalServerErrorException('Failed to fetch course curriculum');
    }
  }
}