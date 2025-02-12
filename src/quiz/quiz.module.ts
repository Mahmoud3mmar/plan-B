import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Quiz, QuizSchema } from './entities/quiz.entity';
import { QuizResult, QuizResultSchema } from './entities/quiz-result.entity';
import { Course, CourseSchema } from '../course/entities/course.entity';
import { CurriculumBlock, CurriculumBlockSchema } from 'src/curriculum-block/entities/curriculum.block.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizResult.name, schema: QuizResultSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CurriculumBlock.name, schema: CurriculumBlockSchema }

    ])
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService]
})
export class QuizModule {}
