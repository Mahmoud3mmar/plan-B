import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import mongoose, { Document, Types } from 'mongoose';
import { Level } from '../../course/utils/levels.enum';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { Student } from '../../student/entities/student.entity';
import { SubTrainingEntity } from '../../subtraining/entities/subtraining.entity';
import { forwardRef, Inject } from '@nestjs/common'; // Use forwardRef for circular dependencies



@Schema()
export class SummerTraining extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string; // URL or path to the image

  @Prop({ default: 0 })
  subTrainingsCount: number; // Duration of the training (e.g., '6 weeks', '3 months')

  @Prop({ type: [Types.ObjectId], ref: Student.name })
  students: Types.ObjectId[]; // Array of student IDs enrolled in the training

  @Prop({ required: true, default: 0 })
  numberOfStudentsEnrolled: number; // Number of students enrolled in the training

  // @IsNotEmpty()
  // @Prop({ type: String, enum: trainingLevel, trainingLevel: Level.AllLevels })
  // level: trainingLevel; 

  // @Prop({ required: true })
  // type: 'online' | 'offline'; // Training mode (either 'online' or 'offline')

  @Prop({ type: [Types.ObjectId], ref: 'SubTrainingEntity', default: [] })
  subTrainings: Types.ObjectId[]; // Correct usage
}

export const SummerTrainingSchema =
  SchemaFactory.createForClass(SummerTraining);
