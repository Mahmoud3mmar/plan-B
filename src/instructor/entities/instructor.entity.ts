import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';
// Define the schema for the Instructor
@Schema()
export class Instructor extends User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  bio: string;

  @Prop({ type: [{ type: String, required: true }, { type: String, required: true }] })
  socialMediaLinks: { type: string; url: string }[]; // Array of social media links with type and URL


  @Prop({ required: true, default: 0 })
  numberOfStudentsEnrolled: number; // Number of students enrolled with this instructor

  @Prop({ required: true, default: 0 })
  numberOfCoursesProvided: number; // Number of courses the instructor provides

  @Prop({ type: [Types.ObjectId], ref: 'Course' })
  courses: Types.ObjectId[]; // Array of course IDs provided by this instructor

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  students: Types.ObjectId[]; // Array of student IDs enrolled in this instructor's courses
}

export const InstructorSchema = SchemaFactory.createForClass(Instructor);
