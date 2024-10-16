import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from '../course/entities/course.entity';
import mongoose, { Model, Types } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PaginateDto } from '../events/dto/get.events.dto';
import { PaginationQueryDto } from './dto/get.category.paginated';
import { CourseCurriculum } from 'src/course-curriculm/entities/course-curriculm.entity';
import { Video } from 'src/vedio/entities/vedio.entity';
import { CurriculumBlock } from 'src/curriculum-block/entities/curriculum.block.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(CourseCurriculum.name) private readonly courseCurriculumModel: Model<CourseCurriculum>,
    @InjectModel(CurriculumBlock.name) private readonly curriculumBlockModel: Model<CurriculumBlock>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    // @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createCategory(
    name: string,
    description?: string,
    image?: Express.Multer.File,
  ): Promise<Category> {
    let imageUrl: string | undefined;

    if (image) {
      const folderName = 'category';
      const uploadResponse = await this.cloudinaryService.uploadImage(
        image,
        folderName,
      );
      imageUrl = uploadResponse.url;
    }

    const category = new this.categoryModel({
      name,
      description,
      image: imageUrl,
    });
    return category.save();
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async incrementCourseCount(categoryId: string): Promise<void> {
    try {
      await this.categoryModel
        .findByIdAndUpdate(
          categoryId,
          { $inc: { courseCount: 1 } }, // Increment the courseCount by 1
          { new: true }, // Return the updated document
        )
        .exec();
    } catch (error) {
      console.error(
        'Error updating category course count:',
        error.message || error,
      );
      throw new InternalServerErrorException(
        'Failed to update category course count',
        error.message,
      );
    }
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async addCourseToCategory(categoryId: string, courseId: string): Promise<void> {
  try {
    // Ensure that categoryId and courseId are valid ObjectIds
    if (!Types.ObjectId.isValid(categoryId) || !Types.ObjectId.isValid(courseId)) {
      throw new NotFoundException('Invalid category or course ID');
    }

    // Use Mongoose's $addToSet to avoid duplicates and $exists to check existence
    const result = await this.categoryModel.updateOne(
      { _id: categoryId, courses: { $ne: courseId } }, // Find category and check if courseId is not in the courses array
      { $addToSet: { courses: courseId } } // Add courseId if it's not already present
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException('Category not found or course already added');
    }
  } catch (error) {
    console.error('Error adding course to category:', error);
    throw new InternalServerErrorException('Failed to add course to category');
  }
}

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async decrementCourseCount(categoryId: string): Promise<void> {
    const result = await this.categoryModel
      .updateOne(
        { _id: categoryId },
        { $inc: { courseCount: -1 } }, // Assuming courseCount is the field to decrement
      )
      .exec();

    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async getAllCategories(paginationQuery: PaginationQueryDto) {
    try {
      const { page = 1, limit = 10, sortField = 'name', sortOrder = 'asc' } = paginationQuery;
      const skip = (page - 1) * limit;

      // Construct sorting options object
      const sortOptions: Record<string, 1 | -1> = {
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      };

      // Fetch categories with pagination, sorting, and populate courses
      const categories = await this.categoryModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort(sortOptions)
        .populate('courses') // Populate courses
        .exec();

      // Count total categories for pagination metadata
      const total = await this.categoryModel.countDocuments().exec();

      return {
        categories,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async doesCategoryExist(categoryId: string): Promise<boolean> {
    try {
      const count = await this.categoryModel.countDocuments({ _id: categoryId }).exec();
      return count > 0;
    } catch (error) {
      console.error('Error checking category existence:', error);
      throw new InternalServerErrorException('Failed to check category existence');
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async getCategoryById(id: string): Promise<Category> {
    try {
      // Validate ID format if needed
      // Fetch category by ID and populate courses
      const category = await this.categoryModel
        .findById(id)
        .populate('courses') // Populate courses field
        .exec();

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return category;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new InternalServerErrorException('Failed to fetch category');
    }
  }



  async deleteCategory(categoryId: string): Promise<void> {
    // Find the category
    const category = await this.categoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Find all courses associated with the category
    const courses = await this.courseModel.find({ category: categoryId });

    // Loop through each course to delete associated curriculum, blocks, and videos
    for (const course of courses) {
      // Delete curriculum blocks if they exist
      if (course.courseCurriculum && course.courseCurriculum.length > 0) {
        const curriculums = await this.courseCurriculumModel.find({ _id: { $in: course.courseCurriculum } });
        
        for (const curriculum of curriculums) {
          // Delete all curriculum blocks
          await this.curriculumBlockModel.deleteMany({ _id: { $in: curriculum.CurriculumBlocks } });
        }

        // Now delete the curriculum itself
        await this.courseCurriculumModel.deleteMany({ _id: { $in: course.courseCurriculum } });
      }

      // Delete videos if they exist
      if (course.videos && course.videos.length > 0) {
        await this.videoModel.deleteMany({ _id: { $in: course.videos } });
      }

      // Finally, delete the course
      await this.courseModel.findByIdAndDelete(course._id);
    }

    // Finally, delete the category
    await this.categoryModel.findByIdAndDelete(categoryId);
  }
}


