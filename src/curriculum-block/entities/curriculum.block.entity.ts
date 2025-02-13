import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Video } from '../../vedio/entities/vedio.entity';
import { CourseCurriculum } from '../../course-curriculm/entities/course-curriculm.entity';
import { Quiz } from '../../quiz/entities/quiz.entity';

@Schema({ timestamps: true })
export class CurriculumBlock extends Document {
    @Prop({ required: true })
    title: string; // Title of the block
  
    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Video' }],default:[] })
    videos: Video[]; // Array of videos in this block
  
    @Prop({ required: true ,default:0})
    totalDuration: string; // Total duration of videos in "hh:mm:ss" format for this block
  
    @Prop({ required: false, default: 0 })
    numberOfLessons: number; // Number of lessons (videos) in the block

    @Prop({ required: false, default: 0 })
    numberOfQuizzes: number; // Number of quizzes in the block
  
    @Prop({ type: Boolean, default: false })
    isPreview: boolean; // Flag to indicate if this block is available for free preview

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Quiz' }], default: [] })
    quizzes: Quiz[]; // Array of quizzes in this block

    @Prop({ required: false })
    pdfUrl?: string; // Field to store the PDF URL

   @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CourseCurriculum', required: true })
  courseCurriculum: CourseCurriculum; // Reference to the course curriculum this block belongs to
}
  
  export const CurriculumBlockSchema = SchemaFactory.createForClass(CurriculumBlock);