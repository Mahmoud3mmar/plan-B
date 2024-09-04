import { Module } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Faq, FaqSchema } from './entities/faq.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Faq.name, schema: FaqSchema }])],

  controllers: [FaqsController],
  providers: [FaqsService],
})
export class FaqsModule {}
