import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Course } from '../../course/entities/course.entity';

@Schema()
export class Review extends Document {

  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
  @Prop()
  email: string;
  @Prop({ required: true, type: String })
  comment: string;

  @Prop({ required: true, type: Number })
  rating: number; // Rating out of 5

  @Prop({ required: true, type: Types.ObjectId, ref: 'Course' })
  courseId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  student: Types.ObjectId;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
