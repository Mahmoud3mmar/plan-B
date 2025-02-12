import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { CourseCurriculum } from '../../course-curriculm/entities/course-curriculm.entity';
import { Faq } from '../../faqs/entities/faq.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { Review } from '../../review/entities/review.entity';
import { Level } from '../utils/levels.enum';
import { Category } from '../../category/entities/category.entity';


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

  @Prop({ required: false, default: 0 })
  numberOfLessons: number;

  @Prop({ required: false, default: 0 })
  numberOfQuizzes: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'CourseCurriculum' }], required: true, default: [] })
  courseCurriculum: CourseCurriculum[]; // Ensure the name matches

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Instructor', required: false })
  instructor: Instructor;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Faq' }], default: [] })
  faqs: Faq[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Review' }], default: [] })
  reviews: Review[];

  @Prop()
  videos: [{ type: MongooseSchema.Types.ObjectId, ref: 'Video' },{ default: [] }];
  @Prop({type: Number, required: true })
  price: number; // Decimal value, represented as a number

  @Prop({ type: Boolean, default: false })
  isPaid: boolean; // Indicates if the course is paid or free

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category'}) // Reference to Category
  category: Category;
  
  @Prop({ type: Number, default: 0 })
  rating: number; // Rating calculated from reviews

  @Prop({ type: String, required: false })
  imageUrl?: string; // URL of the course image

  @Prop({ type: [Types.ObjectId], ref: 'Student', default: [] }) // Array of user IDs who purchased the course
  enrolledStudents: Types.ObjectId[];

  @Prop({ type: [{
    studentId: { type: Types.ObjectId, ref: 'Student', required: true },
    quizId: { type: Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    completedAt: { type: Date, required: true }
  }], default: [] })
  quizResults: {
    studentId: Types.ObjectId;
    quizId: Types.ObjectId;
    score: number;
    passed: boolean;
    completedAt: Date;
  }[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
