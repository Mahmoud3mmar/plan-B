import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CurriculumBlock } from '../../curriculum-block/entities/curriculum.block.entity';

@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }, // Index of the correct option
    explanation: { type: String, required: true }
  }], required: true })
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];

  @Prop({ type: Number, required: true, default: 0 })
  passingScore: number; // Minimum score required to pass (percentage)

  @Prop({ type: Number, required: true, default: 0 })
  timeLimit: number; // Time limit in minutes

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CurriculumBlock', required: true })
  curriculumBlock: CurriculumBlock;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
