import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Course } from '../../course/entities/course.entity';

@Schema()
export class Faq extends Document {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;

  @Prop({ type: Types.ObjectId, ref: Course.name, nullable: true })
  course?: Types.ObjectId; // Reference to Course document
}

export const FaqSchema = SchemaFactory.createForClass(Faq);