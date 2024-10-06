import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Adds createdAt and updatedAt fields automatically
export class Events extends Document {
  @Prop({ required: true })
  eventName: string;

  @Prop({ required: true, validate: { validator: (value: Date) => value >= new Date(), message: 'Event date cannot be in the past' } })
  eventDate: Date;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  speakerName: string;


  @Prop({ required: true })
  thumbnailImage: string; // URL to the event's thumbnail image
  
  @Prop({ type: [String], default: [] }) // Array of student IDs
  enrolledStudents: string[];
}

export const EventSchema = SchemaFactory.createForClass(Events);
