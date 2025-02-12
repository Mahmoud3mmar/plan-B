// sub-training.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { Level } from '../../course/utils/levels.enum';
import { SummerTraining } from '../../summertraining/entities/summertraining.entity';
import { IsNotEmpty, IsArray, ArrayNotEmpty, IsOptional } from 'class-validator';

export enum trainingLevel {
  One = 'One',
  Two = 'Two',
  Three = 'Three',
  Four = 'Four',
  Five = 'Five',
  Six = 'Six',
  Graduate = 'Graduate',
  AllLevels = 'AllLevels',
}

export class Topics {
  @Prop({ type: Types.ObjectId, required: true, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;
}

@Schema()
export class SubTrainingEntity extends Document {
  @Prop({ required: true })
  name: string; // Name of the sub-training

  // @Prop({ type: Types.ObjectId, ref: 'Instructor', required: true })
  // instructor: Types.ObjectId; // Reference to the instructor teaching the sub-training

  @Prop({ required: true })
  duration: string; // Duration of the sub-training (e.g., '4 weeks', '2 months')

  @Prop({ required: false, default: 0 })
  numberOfLessons?: number; // Number of lessons in the sub-training

  @Prop({ required: true, default: 0 })
  numberOfStudentsEnrolled: number; // Number of students enrolled in the sub-training

  @Prop({ required: true })
  image: string; 

 
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  speciality: string;
  
  @Prop({ required: true })
  location_Name: string; 

 
  @Prop({ required: true })
  location_Lat: string; 

 
  @Prop({ required: true })
  location_Long: string; 

 

  @Prop({ required: true })
  isPaid: boolean; // Whether the sub-training is paid or not

  
  @Prop()
  price?: number; 

  
  @Prop()
  seats: number; 

  
  @Prop({ default: function() { return this.seats; } }) // Set default to the value of seats
  AvailableSeats: number; 
  @Prop({ type: Types.ObjectId, ref: 'SummerTraining', required: true })
  summerTraining: Types.ObjectId; // Reference to the SummerTrainingEntity

  
  @Prop({ required: true })
  type: 'online' | 'offline'; // Training mode (either 'online' or 'offline')

  
  @Prop({ type: [Topics], required: true })
  topic: Topics[]


  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Prop({ type: [String], enum: trainingLevel, default: [trainingLevel.AllLevels] })
  level?: trainingLevel[];

  @Prop({ required: false })
  hasOffer: boolean;

  @Prop({ required: false })
  offerPrice?: number;

  @Prop({ required: false })
  offerStartDate?: Date;

  @Prop({ required: false })
  offerEndDate?: Date;

  @Prop({ required: false })
  offerDescription?: string;

  @Prop({ required: false, default: 0 })
  discountPercentage?: number;
}

export const SubTrainingSchema = SchemaFactory.createForClass(SubTrainingEntity);
