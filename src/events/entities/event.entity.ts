import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


// Define the Speaker class within the same file
 export class Speaker {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string; // URL to the speaker's image

  @Prop({ required: true })
  about: string; // Description about the speaker
} 


export class Agenda {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  time: string; 

} 

@Schema({ timestamps: true }) // Adds createdAt and updatedAt fields automatically
export class Events extends Document {
  @Prop({ required: true })
  eventName: string;

  @Prop({ required: true, validate: { validator: (value: Date) => value >= new Date(), message: 'Event date cannot be in the past' } })
  eventDate: Date;

  @Prop({ required: true })
  small_Description: string;


  @Prop({ required: true })
  big_Description: string;


  @Prop({ required: true })
  location_Name: string;


  @Prop({ required: true })
  location_Lat: string;

  @Prop({ required: true })
  location_Long: string;

  
  @Prop({ type: [Speaker], required: true, default: [] }) // Default to an empty array
  speakers: Speaker[]; // Array of speaker objects

  @Prop({ type: [Agenda], required: true })
  agenda: Agenda[]

  @Prop({ required: true })
  thumbnailImage: string; // URL to the event's thumbnail image
  
  @Prop({ type: [String], default: [] }) // Array of student IDs
  enrolledStudents: string[];


   @Prop({ required: true, default: false }) // Indicates if the event is paid
  isPaid: boolean;

  @Prop() // Price is required if isPaid is true
  price: number; // Price of the event
}
export const EventSchema = SchemaFactory.createForClass(Events);
