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
import { CourseCurriculmModule } from './course-curriculm/course-curriculm.module';
import { StudentModule } from './student/student.module';
import { TokenBlacklistModule } from './token-blacklist/token-blacklist.module';
 
import { VedioModule } from './vedio/vedio.module';
import { EventsModule } from './events/events.module';
import { CategoryModule } from './category/category.module';
import { SubtrainingModule } from './subtraining/subtraining.module';
import { CurriculumBlockModule } from './curriculum-block/curriculum.block.module';
import { AwsModule } from './aws/aws.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { FawryModule } from './fawry/fawry.module';
import { NationalityI18nModule } from './nationality-i18n/nationality-i18n.module';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [AuthModule, UserModule, CourseModule, FaqsModule, InstructorModule, ReviewModule, SummertrainingModule,VedioModule,
    ConfigModule.forRoot({
    isGlobal: true,
  }),
 
  MongooseModule.forRoot(process.env.MONGODB_URI),
  CourseCurriculmModule,
  StudentModule,  
  TokenBlacklistModule,
  VedioModule, 
  EventsModule,
  CategoryModule, 
  SubtrainingModule,
  CurriculumBlockModule,
  AwsModule,
  ContactUsModule,
  FawryModule,
  NationalityI18nModule,
  QuizModule,  

],
  controllers: [AppController], 
  providers: [AppService
  
  ],
})
export class AppModule {}
