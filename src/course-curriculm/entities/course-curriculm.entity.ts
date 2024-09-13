import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class CourseCurriculum extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  numberOfLessons: number;

  @Prop({ required: true })
  duration: number; // Duration in hours
}

export const CourseCurriculumSchema = SchemaFactory.createForClass(CourseCurriculum);
