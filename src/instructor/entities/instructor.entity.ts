import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Instructor extends Document {
  @Prop({ required: true, length: 255 })
  name: string;

  @Prop({ required: true, type: String })
  bio: string;

  @Prop({ type: [String], default: [] })
  socialMediaUrls: string[];

  @Prop({ type: Number, default: 0 })
  numberOfCourses: number;

//   @Prop({ type: [{ type: Types.ObjectId, ref: Course.name }], default: [] })
//   courses: Types.ObjectId[]; // Array of references to Course documents
}

export const InstructorSchema = SchemaFactory.createForClass(Instructor);
