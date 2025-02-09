import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class QuizResult extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quiz', required: true })
  quiz: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Student', required: true })
  student: string;

  @Prop({ type: [{
    questionIndex: { type: Number, required: true },
    selectedAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true }
  }]})
  answers: {
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  passed: boolean;

  @Prop({ required: true })
  completedAt: Date;
}

export const QuizResultSchema = SchemaFactory.createForClass(QuizResult); 