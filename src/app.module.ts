import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { FaqsModule } from './faqs/faqs.module';
import { InstructorModule } from './instructor/instructor.module';
import { ReviewModule } from './review/review.module';
import { SummertrainingModule } from './summertraining/summertraining.module';

import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [AuthModule, UserModule, CourseModule, FaqsModule, InstructorModule, ReviewModule, SummertrainingModule,
    ConfigModule.forRoot({
    isGlobal: true,
  }),
  MongooseModule.forRoot(process.env.MONGODB_URI)
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
