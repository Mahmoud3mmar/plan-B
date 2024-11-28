import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Course } from '../../course/entities/course.entity';

@Schema({ timestamps: true })
export class Video extends Document {
  @Prop({ required: true, maxlength: 255 })
  title: string; // Title of the video

  @Prop({ required: true })
  description: string; // Brief description of the video

  @Prop({ required: true })
  duration: string; // Duration in "mm:ss" format

  @Prop({ required: true })
  videoUrl: string; // URL of the video hosted on a cloud service

  @Prop({ required: true })
  fileId: string; // Backblaze file ID

  @Prop()
  signedUrl: string; // Temporary signed URL for accessing the video

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: Course; // Reference to the course this video belongs to

  @Prop({ type: Date, default: Date.now })
  uploadDate: Date; // Date when the video was uploaded

  @Prop({ type: Number, default: 0 })
  views: number; // Number of views the video has received

  @Prop({ type: Boolean, default: true })
  isActive: boolean; // Indicates if the video is active and available for viewing

  @Prop()
  size: string; // Size of the video file in MB

  @Prop()
  bucketName: string; // Name of the bucket where the video is stored
}

export const VideoSchema = SchemaFactory.createForClass(Video);
