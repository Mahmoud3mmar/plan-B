import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema()
export class Review extends Document {
  @Prop({ required: true, type: String })
  comment: string;

  @Prop({ required: true, type: Number })
  rating: number; // Rating out of 5

//   @Prop({ type: Types.ObjectId, ref: Course.name }) // Reference to Course model
//   course: Types.ObjectId;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
