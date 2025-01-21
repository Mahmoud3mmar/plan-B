import {  Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsEmail, IsPhoneNumber } from 'class-validator';
import { trainingLevel } from './subtraining.entity';
import { Level } from 'src/course/utils/levels.enum';


@Schema()
export class subTrainingPurchase extends Document {
  // @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  // userId: Types.ObjectId; // Reference to the user making the purchase

  @Prop({ type: Types.ObjectId, ref: 'SummerTraining', required: true })
  summerTrainingId: Types.ObjectId; // Reference to the summer training

  @Prop({ type: Types.ObjectId, ref: 'SubTrainingEntity', required: true })
  subTrainingId: Types.ObjectId; // Reference to the sub-training

  @IsNotEmpty()
  @Prop({ required: true })
  university: string; // University of the student

  @IsNotEmpty()
  @Prop({ type: String, enum: trainingLevel, trainingLevel: Level.AllLevels })
  level: trainingLevel; 


  @IsNotEmpty()
  @IsEmail()
  @Prop({ required: true })
  email: string; // Email of the student

  @IsNotEmpty()
  @Prop({ required: true })
  firstName: string; // First name of the student

  @IsNotEmpty()
  @Prop({ required: true })
  lastName: string; // Last name of the student

  @IsNotEmpty()
  @Prop({ required: true })
  nationality: string; // Nationality of the student

  @IsNotEmpty()
  @IsPhoneNumber()
  @Prop({ required: true })
  phoneNumber: string; // Phone number of the student

  @Prop({ required: true, default: 'PENDING' })
  paymentStatus: string; // Payment status (e.g., PENDING, PAID, FAILED)

  @Prop({ required: true })
  paymentReference: string; // Unique reference for the payment (e.g., Fawry reference)

  @Prop({ default: Date.now })
  createdAt: Date; // Timestamp of when the purchase was created
}

export const subTrainingPurchaseSchema = SchemaFactory.createForClass(subTrainingPurchase);