import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { Video } from './entities/vedio.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateVideoDto } from './dto/create.vedio.dto';
import { UpdateVideoDto } from './dto/update.vedio.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Course } from '../course/entities/course.entity';
import { CurriculumBlock } from '../curriculum-block/entities/curriculum.block.entity';

@Injectable()
export class VedioService {
  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(CurriculumBlock.name) private readonly curriculumBlockModel: Model<CurriculumBlock>,


    private readonly cloudinaryService: CloudinaryService, // Inject the Cloudinary service
  ) {}
  // async createVideo(
  //   createVideoDto: CreateVideoDto,
  //   courseId: string,
  //   video: Express.Multer.File,
  // ): Promise<Video> {
  //   try {
  //     const folderName = 'Courses'; // or any other dynamic name based on context

  //     // Step 1: Upload video to Cloudinary
  //     const uploadResult = await this.cloudinaryService.uploadVideo(
  //       video,
  //       folderName,
  //     );
  
  //     if (!uploadResult || !uploadResult.secure_url || !uploadResult.public_id) {
  //       throw new InternalServerErrorException('Video upload failed');
  //     }
  
  //     console.log('Upload result:', uploadResult); // Log upload result
  
  //     // Step 2: Create and save the video record in MongoDB
  //     const createdVideo = new this.videoModel({
  //       ...createVideoDto,
  //       course: courseId,
  //       videoUrl: uploadResult.secure_url,
  //       publicId: uploadResult.public_id, // Ensure this field is correctly saved
  //     });
  
  //     const savedVideo = await createdVideo.save();
  //     console.log('Video created and saved to DB:', savedVideo);
  
  //     // Step 3: Update the course by adding the new video ID to its 'videos' array
  //     const updatedCourse = await this.courseModel.findByIdAndUpdate(
  //       courseId,
  //       { $push: { videos: savedVideo._id } },
  //       { new: true, useFindAndModify: false },
  //     );
  
  //     if (!updatedCourse) {
  //       throw new NotFoundException(`Course with ID ${courseId} not found`);
  //     }
  
  //     // console.log('Video added to course:', updatedCourse);
  
  //     return savedVideo;
  //   } catch (error) {
  //     console.error('Error creating video:', error.message || error);
  //     throw new InternalServerErrorException('Failed to create video');
  //   }
  // }
  // Helper method to upload video to Cloudinary
 
 
 
  
async createVideo(
  createVideoDto: CreateVideoDto,
  courseId: string,
  curriculumBlockId: string,
  video: Express.Multer.File,
): Promise<Video> {
  try {
    const folderName = 'Courses'; // or any other dynamic name based on context

    // Step 1: Upload video to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadVideo(
      video,
      folderName,
    );

    if (!uploadResult || !uploadResult.secure_url || !uploadResult.public_id) {
      throw new InternalServerErrorException('Video upload failed');
    }

    console.log('Upload result:', uploadResult); // Log upload result

    // Step 2: Find the course by ID
    const course = await this.courseModel.findById(courseId).populate('courseCurriculum');
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Step 3: Find the curriculum block by curriculumBlockId
    const curriculumBlock = await this.curriculumBlockModel.findById(curriculumBlockId);
    if (!curriculumBlock) {
      throw new NotFoundException(`Curriculum Block with ID ${curriculumBlockId} not found`);
    }

    // // Step 4: Ensure the curriculum block belongs to the course's curriculum
    // if (curriculumBlock.courseCurriculum.toString() !== course.courseCurriculum.toString()) {
    //   throw new BadRequestException(
    //     `Curriculum Block with ID ${curriculumBlockId} does not belong to the Course's curriculum`,
    //   );
    // }

    // Step 5: Create and save the video record in MongoDB
    const createdVideo = new this.videoModel({
      ...createVideoDto,
      course: courseId,
      videoUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id, // Ensure this field is correctly saved
    });
   
    const savedVideo = await createdVideo.save();
    await this.courseModel.findByIdAndUpdate(
      courseId,
      {
        $push: { videos: savedVideo._id },
        // totalDuration: updatedTotalDuration,
      },
      { new: true, useFindAndModify: false },
    );

    
    console.log('Video created and saved to DB:', savedVideo);

    

  // Step 6: Calculate the video duration in minutes
  const videoDurationInMinutes = this.convertDurationToMinutes(createVideoDto.duration);
  console.log(`Video duration in minutes: ${videoDurationInMinutes}`); // Log video duration

  // Step 7: Convert the existing totalDuration of the curriculum block to minutes
  const currentDurationInMinutes = this.convertDurationToMinutes(curriculumBlock.totalDuration || '00:00');
  console.log(`Current duration in minutes: ${currentDurationInMinutes}`); // Log current duration

  // Step 8: Calculate the new total duration
  const updatedTotalDurationInMinutes = currentDurationInMinutes + videoDurationInMinutes;
  console.log(`Updated total duration in minutes: ${updatedTotalDurationInMinutes}`); // Log updated duration

    // Step 11: Update the curriculum block with the new totalDuration and add the video ID
    const updatedBlock = await this.curriculumBlockModel.findByIdAndUpdate(
      curriculumBlockId,
      {
        $push: { videos: savedVideo._id },
        totalDuration: this.convertMinutesToDuration(updatedTotalDurationInMinutes), // Convert back to 'mm:ss' format
      },
      { new: true, useFindAndModify: false },
    );

    if (!updatedBlock) {
      throw new NotFoundException(`Curriculum Block with ID ${curriculumBlockId} not found`);
    }

    // console.log('Video added to curriculum block:', updatedBlock);

    return savedVideo;
  } catch (error) {
    console.error('Error creating video:', error.message || error);
    throw new InternalServerErrorException('Failed to create video');
  }
}
// Helper Functions
private convertDurationToMinutes(duration: string): number {
  if (!duration) {
    return 0; // Default to 0 for undefined or empty duration
  }

  const parts = duration.split(':');
  if (parts.length !== 2) {
    return 0; // Return 0 if the format is invalid
  }

  const [minutes, seconds] = parts.map(Number);
  return isNaN(minutes) || isNaN(seconds) ? 0 : minutes + seconds / 60;
}

private convertMinutesToDuration(minutes: number): string {
  const totalSeconds = Math.floor(minutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async getVideosForCourse(
    courseId: string,
    page: number,
    limit: number,
    sortBy: string = 'uploadDate',
    sortOrder: string = 'desc',
  ): Promise<{ videos: Video[]; total: number }> {
    try {
      // Validate sortBy and sortOrder to prevent injection attacks and use default values
      const validSortByFields = ['uploadDate', 'title', 'duration'];
      const sortField = validSortByFields.includes(sortBy)
        ? sortBy
        : 'uploadDate';
      const validSortOrders = ['asc', 'desc'];
      const sortDirection = validSortOrders.includes(sortOrder)
        ? sortOrder === 'asc'
          ? 1
          : -1
        : -1;

      // Check if the course exists
      const courseExists = await this.courseModel.exists({ _id: courseId });
      if (!courseExists) {
        throw new NotFoundException('Course not found');
      }

      // Calculate the skip value for pagination
      const skip = (page - 1) * limit;

      // Find videos for the specific courseId with pagination and sorting
      const [videos, total] = await Promise.all([
        this.videoModel
          .find({ course: courseId }) // Assuming courseId is directly referenced
          .skip(skip)
          .limit(limit)
          .sort({ [sortField]: sortDirection }) // Sort by the specified field in the determined direction
          .exec(),
        this.videoModel.countDocuments({ course: courseId }).exec(), // Assuming courseId is directly referenced
      ]);

      return { videos, total };
    } catch (error) {
      console.error('Error retrieving videos:', error.message || error);
      throw new InternalServerErrorException('Failed to retrieve videos');
    }
  }
  async findOne(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return video;
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    const video = await this.videoModel
      .findByIdAndUpdate(id, updateVideoDto, { new: true })
      .exec();
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return video;
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async deleteVideo(videoId: string, courseId: string): Promise<void> {
    try {
      // Validate input parameters
      if (!videoId || !courseId) {
        throw new BadRequestException('Video ID and Course ID are required');
      }

      // Step 1: Find and delete the video from the Video entity (videoModel)
      const video = await this.videoModel.findByIdAndDelete(videoId).exec();
      if (!video) {
        throw new NotFoundException(`Video with ID ${videoId} not found`);
      }

      // Step 2: Remove the video reference from the Course entity (courseModel)
      const updatedCourse = await this.courseModel.findByIdAndUpdate(
        courseId,
        { $pull: { videos: videoId } }, // Remove the videoId from the 'videos' array
        { new: true, useFindAndModify: false }
      ).exec();

      if (!updatedCourse) {
        throw new NotFoundException(`Course with ID ${courseId} not found or video was not removed from course`);
      }

      console.log(`Video with ID ${videoId} deleted from Course with ID ${courseId}`);

    } catch (error) {
      console.error('Error deleting video:', error.message || error);
      throw new InternalServerErrorException('Failed to delete video');
    }
  }
  
}
