import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string; // URL to the category's image

  @Prop({ default: 0 })
  courseCount: number; // Number of courses in this category

 
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }], default: [] })
  courses: MongooseSchema.Types.ObjectId[]; // Array of course ObjectIds
}

export const CategorySchema = SchemaFactory.createForClass(Category);
