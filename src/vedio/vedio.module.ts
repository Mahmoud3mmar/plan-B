import { Module } from '@nestjs/common';
import { VedioService } from './vedio.service';
import { Video, VideoSchema } from './entities/vedio.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { VedioController } from './vedio.controller';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Course, CourseSchema } from '../course/entities/course.entity';
import { CurriculumBlock, CurriculumBlockSchema } from '../curriculum-block/entities/curriculum.block.entity';
import { AwsService } from 'src/aws/aws.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CurriculumBlock.name, schema: CurriculumBlockSchema },
 
    ]),
  ],
  controllers: [VedioController],
  providers: [VedioService,CloudinaryService,AwsService],
})
export class VedioModule {}
