import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Role } from '../common utils/Role.enum';

@Schema({ timestamps: true, discriminatorKey: 'role' })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id?: mongoose.Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  phoneNumber: string;

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

  @Prop({ type: String, enum: Role,required: true,default: Role.STUDENT })
  role: Role;

  @Prop({ nullable: true })
  resetPasswordToken?: string;

  @Prop({ nullable: true })
  resetPasswordExpires?: Date;

  @Prop({ default: false })
  isVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
