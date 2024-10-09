// sub-training.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { Level } from '../../course/utils/levels.enum';
import { SummerTraining } from 'src/summertraining/entities/summertraining.entity';

@Schema()
export class SubTrainingEntity extends Document {
  @Prop({ required: true })
  name: string; // Name of the sub-training

  @Prop({ type: Types.ObjectId, ref: 'Instructor', required: true })
  instructor: Types.ObjectId; // Reference to the instructor teaching the sub-training

  @Prop({ required: true })
  duration: string; // Duration of the sub-training (e.g., '4 weeks', '2 months')

  @Prop({ required: true, default: 0 })
  numberOfLessons: number; // Number of lessons in the sub-training

  @Prop({ required: true, default: 0 })
  numberOfStudentsEnrolled: number; // Number of students enrolled in the sub-training

  @Prop({ required: true })
  image: string; // URL or path to the sub-training image

  @Prop({ required: true, type: String, enum: Level, default: Level.AllLevels })
  level: Level; // Level of the sub-training (e.g., 'Beginner', 'Intermediate', 'Advanced')

  @Prop({ required: true })
  isPaid: boolean; // Whether the sub-training is paid or not

  @Prop({ type: Types.ObjectId, ref: SummerTraining.name, required: true })
  summerTraining: Types.ObjectId; // Reference to the SummerTrainingEntity
}

export const SubTrainingSchema = SchemaFactory.createForClass(SubTrainingEntity);
