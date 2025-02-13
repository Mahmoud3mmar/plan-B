import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateCurriculumBlockDto } from './dto/create.curriculum.block.dto';
import { UpdateCurriculumBlockDto } from './dto/update-curriculum-block.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CurriculumBlock } from './entities/curriculum.block.entity';
import { Model } from 'mongoose';
import { CourseCurriculum } from '../course-curriculm/entities/course-curriculm.entity';
import { Course } from '../course/entities/course.entity';
import { Video } from '../vedio/entities/vedio.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CurriculumBlockService {
  constructor(
    @InjectModel(CurriculumBlock.name) private curriculumBlockModel: Model<CurriculumBlock>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(CourseCurriculum.name) private curriculumModel: Model<CourseCurriculum>,
    private readonly cloudinaryService: CloudinaryService,
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

  // async uploadPdf(curriculumBlockId: string, pdf: Express.Multer.File): Promise<CurriculumBlock> {
  //   const curriculumBlock = await this.curriculumBlockModel.findById(curriculumBlockId).exec();
  //   if (!curriculumBlock) {
  //     throw new NotFoundException(`CurriculumBlock with ID ${curriculumBlockId} not found`);
  //   }

  //   const uploadResult = await this.cloudinaryService.uploadPdf(pdf);
  //   if (!uploadResult) {
  //     throw new InternalServerErrorException('Failed to upload PDF to Cloudinary.');
  // }

  //   curriculumBlock.pdfUrl = uploadResult.secure_url;
  //   await curriculumBlock.save();

  //   return curriculumBlock;
  // }

  async uploadCurriculumPdf(curriculumBlockId: string, pdf: Express.Multer.File): Promise<string> {
    const curriculumBlock = await this.curriculumBlockModel.findById(curriculumBlockId).exec();
    if (!curriculumBlock) {
        throw new NotFoundException(`CurriculumBlock with ID ${curriculumBlockId} not found`);
    }

    const uploadResult = await this.cloudinaryService.uploadPdf(pdf);
    if (!uploadResult) {
        throw new InternalServerErrorException('Failed to upload PDF to Cloudinary.');
    }

    curriculumBlock.pdfUrl = uploadResult; // Assuming you have a pdfUrl field in your CurriculumBlock schema
    await curriculumBlock.save();

    return uploadResult; // Return the URL of the uploaded PDF
  }

  // Method to get the PDF URL for a specific curriculum block
  async getCurriculumPdf(curriculumBlockId: string): Promise<string> {
    const curriculumBlock = await this.curriculumBlockModel.findById(curriculumBlockId).exec();
    if (!curriculumBlock) {
      throw new NotFoundException(`CurriculumBlock with ID ${curriculumBlockId} not found`);
    }
    return curriculumBlock.pdfUrl; // Assuming pdfUrl is the field where the PDF URL is stored
  }

  // Method to delete the PDF URL for a specific curriculum block
  async deleteCurriculumPdf(curriculumBlockId: string): Promise<void> {
    const curriculumBlock = await this.curriculumBlockModel.findById(curriculumBlockId).exec();
    if (!curriculumBlock) {
      throw new NotFoundException(`CurriculumBlock with ID ${curriculumBlockId} not found`);
    }
    curriculumBlock.pdfUrl = null; // Clear the PDF URL
    await curriculumBlock.save();
  }
}