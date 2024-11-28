import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Adds createdAt and updatedAt fields automatically
export class ContactUs extends Document {
  @Prop({ required: true })
  name: string; // Name of the person contacting

  @Prop({ required: true, unique: true }) // Ensure email is unique
  email: string; // Email of the person contacting

  @Prop({ required: true })
  phoneNumber: string; // Phone number of the person contacting

  @Prop({ required: true })
  msg: string; // Message from the person contacting
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);