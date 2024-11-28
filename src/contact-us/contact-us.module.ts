import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { ContactUs, ContactUsSchema } from './entities/contact-us.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContactUs.name, schema: ContactUsSchema }]),
  ],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}
