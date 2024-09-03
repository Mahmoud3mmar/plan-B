

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../common utils/Role.enum';
import mongoose from 'mongoose';





@Schema({ timestamps: true })
export class User  {
  @Prop({ auto: true})
  _id!: mongoose.Types.ObjectId;
  @Prop({ required: true })
  firstName: string;  // New field

  @Prop({ required: true })
  lastName: string;   // New field

  @Prop({ required: true })
  phoneNumber: string; // New field

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  confirmPassword: string;


  @Prop({ nullable: true })
  otp?: string;

  @Prop({ nullable: true })
  otpExpiration?: Date;

  @Prop({ nullable: true })
  refreshToken?: string;

  @Prop({ type: String, enum: Role, default: Role.ADMIN })
  role: Role;

  @Prop({ nullable: true })
  resetPasswordToken?: string;

  @Prop({ nullable: true })
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
