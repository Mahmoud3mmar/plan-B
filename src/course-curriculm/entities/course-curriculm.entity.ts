import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CurriculumBlock } from '../../curriculum-block/entities/curriculum.block.entity';

@Schema({ timestamps: true })
export class CourseCurriculum extends Document {
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'CurriculumBlock' }] })
  CurriculumBlocks: CurriculumBlock[]; // Array of blocks in the course curriculum
}

export const CourseCurriculumSchema = SchemaFactory.createForClass(CourseCurriculum);
