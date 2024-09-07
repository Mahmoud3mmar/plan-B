

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../common utils/Role.enum';
import mongoose from 'mongoose';





@Schema({ timestamps: true ,discriminatorKey: 'role'})
export class User  {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id?: mongoose.Types.ObjectId;
  
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




  @Prop({ nullable: true })
  otp?: string;

  @Prop({ nullable: true })
  otpExpiration?: Date;

  @Prop({ nullable: true })
  refreshToken?: string;

  @Prop({ type: String, enum: Role, default: Role.STUDENT })
  role: Role;

  @Prop({ nullable: true })
  resetPasswordToken?: string;

  @Prop({ nullable: true })
  resetPasswordExpires?: Date;

  @Prop({ nullable: true })



  @Prop({default:false})
  isVerified: boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);
