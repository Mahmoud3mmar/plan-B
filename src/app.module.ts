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
import { UserEntity } from './user/entities/user.entity';
import { CourseEntity } from './course/entities/course.entity';
import { FaqEntity } from './faqs/entities/faq.entity';
import { ReviewEntity } from './review/entities/review.entity';
import { InstructorEntity } from './instructor/entities/instructor.entity';
import { SummertrainingEntity } from './summertraining/entities/summertraining.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, UserModule, CourseModule, FaqsModule, InstructorModule, ReviewModule, SummertrainingModule,
    ConfigModule.forRoot({
    isGlobal: true,
  }),
  TypeOrmModule.forRoot({
    type: 'mongodb',
    url: 'mongodb+srv://mahmoudammar560:ammar@2024@cluster0.6niiy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    port: 27017,

    database: 'plan-b',
    synchronize: true,
    username: 'mahmoudammar560',
    password: 'ammar@2024',
    entities: [
      UserEntity,
      CourseEntity,
      FaqEntity,
      ReviewEntity,
      InstructorEntity,
      SummertrainingEntity,
    ],

    useUnifiedTopology: true,
    useNewUrlParser: true,
    authSource: "admin",
    ssl: true,

   
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
