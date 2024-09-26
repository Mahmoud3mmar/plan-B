import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import { Document, Types } from 'mongoose';
import { Level } from '../../course/utils/levels.enum';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { Student } from '../../student/entities/student.entity';
import { SubTrainingEntity } from '../../subtraining/entities/subtraining.entity';


@Schema()
export class SummerTraining extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string; // URL or path to the image

  @Prop({ required: true })
  duration: string; // Duration of the training (e.g., '6 weeks', '3 months')

  @Prop({ type: [Types.ObjectId], ref: Student.name })
  students: Types.ObjectId[]; // Array of student IDs enrolled in the training

  @Prop({ required: true, default: 0 })
  numberOfStudentsEnrolled: number; // Number of students enrolled in the training

  
  @IsNotEmpty()
  @Prop({ type: String, enum: Level, default: Level.AllLevels })
  level: Level; // Level of the training (e.g., 'Beginner', 'Intermediate', 'Advanced')
  



  @Prop({ required: true })
  type: 'online' | 'offline'; // Training mode (either 'online' or 'offline')

  
  // Relationship with SubTraining
  @Prop({ type: [Types.ObjectId], ref: SubTrainingEntity.name, default: [] })
  subTrainings: Types.ObjectId[]; // Array of sub-training IDs
}

export const SummerTrainingSchema = SchemaFactory.createForClass(SummerTraining);
