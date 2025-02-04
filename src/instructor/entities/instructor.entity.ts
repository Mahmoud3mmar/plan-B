import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { SubTrainingEntity } from '../../subtraining/entities/subtraining.entity';

class SocialMediaLink {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  url: string;
}

@Schema()
export class Instructor extends User {
 
  @Prop({ required: false,default:''  })
  bio: string;

  @Prop({ required: false ,default:''  })
  profileImage?: string; // New field for profile image URL

  @Prop({ type: [SocialMediaLink], required: false,default:[] })
  socialMediaLinks: SocialMediaLink[];

  @Prop({ required: false, default: 0 })
  numberOfStudentsEnrolled: number;

  @Prop({ required: false, default: 0 })
  numberOfCoursesProvided: number;

  @Prop({ type: [Types.ObjectId], ref: 'Course' ,default:[] })
  courses: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User' ,default:[] })
  students: Types.ObjectId[];

  // @Prop({ type: [Types.ObjectId], ref: SubTrainingEntity.name })
  // subTrainings: Types.ObjectId[]; // List of SubTrainingEntities taught by this instructor
}

export const InstructorSchema = SchemaFactory.createForClass(Instructor);
// Ensure that deleting a User cascades to Instructor or Student
