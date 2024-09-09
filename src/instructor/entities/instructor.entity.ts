import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';

class SocialMediaLink {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  url: string;
}

@Schema()
export class Instructor extends User {
 
  @Prop({ required: true })
  bio: string;

  @Prop({ required: false })
  profileImage?: string; // New field for profile image URL

  @Prop({ type: [SocialMediaLink], required: true })
  socialMediaLinks: SocialMediaLink[];

  @Prop({ required: true, default: 0 })
  numberOfStudentsEnrolled: number;

  @Prop({ required: true, default: 0 })
  numberOfCoursesProvided: number;

  @Prop({ type: [Types.ObjectId], ref: 'Course' })
  courses: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  students: Types.ObjectId[];
}

export const InstructorSchema = SchemaFactory.createForClass(Instructor);
// Ensure that deleting a User cascades to Instructor or Student
