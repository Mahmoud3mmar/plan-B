import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true, maxlength: 255 })
  name: string;

  @Prop({ required: true })
  overview: string;

  @Prop({ required: true })
  duration: number; // Duration in hours

  @Prop({ required: true })
  studentsEnrolled: number;

  @Prop({ 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Expert', 'All Levels'], 
    default: 'All Levels' 
  })
  level: 'Beginner' | 'Intermediate' | 'Expert' | 'All Levels';

  @Prop({ required: true })
  numberOfLessons: number;

  @Prop({ required: true })
  numberOfQuizzes: number;

  @Prop({ type: [String], required: true })
  curriculum: string[]; // Array of curriculum items

  @Prop({type: Number, required: true })
  price: number; // Decimal value, represented as a number
}

export const CourseSchema = SchemaFactory.createForClass(Course);
