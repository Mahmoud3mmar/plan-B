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
  duration: string; // Change this to string to store in "mm:ss" format

  @Prop({ required: true })
  videoUrl: string; // URL of the video hosted on a cloud service

  @Prop({ required: true })
  publicId: string; // Add this field

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: Course; // Reference to the course this video belongs to

  @Prop({ type: Date, default: Date.now })
  uploadDate: Date; // Date when the video was uploaded

  @Prop({ type: String, required: false })
  thumbnailUrl?: string; // URL of the video thumbnail (optional)

  @Prop({ type: Number, default: 0 })
  views: number; // Number of views the video has received

  @Prop({ type: Boolean, default: false })
  isActive: boolean; // Indicates if the video is active and available for viewing
}

export const VideoSchema = SchemaFactory.createForClass(Video);
