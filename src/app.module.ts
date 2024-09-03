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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Module({
  imports: [AuthModule, UserModule, CourseModule, FaqsModule, InstructorModule, ReviewModule, SummertrainingModule,
    ConfigModule.forRoot({
    isGlobal: true,
  }),
  // TypeOrmModule.forRoot({
  //   type: 'mongodb',
  //   url: 'mongodb+srv://mahmoudammar560:ammar@2024@cluster0.6niiy.mongodb.net/plan-b?retryWrites=true&w=majority',
  //   useUnifiedTopology: true,
  //   useNewUrlParser: true,
  //   synchronize: true, // Make sure you use this only in development
  //   entities: [ 
  //     UserEntity,
  //     CourseEntity,
  //     FaqEntity,
  //     ReviewEntity,
  //     InstructorEntity,
  //     SummertrainingEntity,
  //   ],
  // }),
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // ConfigModule.forRoot(), // Ensure this is here to load .env variables
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => {
    //     const uri = configService.get<string>('MONGODB_URI');
    //     console.log('MongoDB URI:', uri); // Log to verify URI
    //     return { uri };
    //   },
    // }),
    
    MongooseModule.forRoot(process.env.MONGODB_URI)
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
