import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CourseCurriculum } from '../../course-curriculm/entities/course-curriculm.entity';
import { Faq } from '../../faqs/entities/faq.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { Review } from '../../review/entities/review.entity';
import { Level } from '../utils/levels.enum';


@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true, maxlength: 255 })
  name: string;

  @Prop({ required: true })
  overview: string;

  @Prop({ required: true,default: 0  })
  duration: number; // Duration in hours

  @Prop({ required: true,default: 0  })
  studentsEnrolled: number;

  @Prop({ 
    type: String, 
    enum: Level, 
    default: Level.AllLevels
  })
  level: Level

  @Prop({ required: true })
  numberOfLessons: number;

  @Prop({ required: true })
  numberOfQuizzes: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Curriculum' }], required: true })
  Coursecurriculum: CourseCurriculum[]; // References to Curriculum entities

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Instructor', required: true })
  instructor: Instructor; // Reference to Instructor

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'FAQ' }], default: [] })
  faqs: Faq[]; // References to FAQ entities

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Review' }], default: [] })
  reviews: Review[]; // References to Review entities

  @Prop({type: Number, required: true })
  price: number; // Decimal value, represented as a number

  @Prop({ type: Boolean, default: false })
  isPaid: boolean; // Indicates if the course is paid or free

  @Prop({ required: true })
  category: string; // Category of the course
  
  @Prop({ type: Number, default: 0 })
  rating: number; // Rating calculated from reviews
}

export const CourseSchema = SchemaFactory.createForClass(Course);
