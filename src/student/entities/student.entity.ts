import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';

@Schema()
export class Student extends User {
  @Prop({ type: [Types.ObjectId], ref: 'Course' })
  coursesEnrolled: Types.ObjectId[];

  @Prop({ type: Map, of: Number }) // Map of courseId -> progress %
  progress: Record<string, number>;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
