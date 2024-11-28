import { Injectable } from '@nestjs/common';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { ContactUs } from './entities/contact-us.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetContactUsDto } from './dto/update-contact-us.dto';

@Injectable()
export class ContactUsService {
  constructor(@InjectModel(ContactUs.name) private contactUsModel: Model<ContactUs>) {}

  async create(createContactUsDto: CreateContactUsDto): Promise<ContactUs> {
    const contactUs = new this.contactUsModel(createContactUsDto);
    return contactUs.save();
  }

  async findAll(GetContactUsDto: GetContactUsDto): Promise<ContactUs[]> {
    const { page = 1, limit = 10 } = GetContactUsDto;
    const skip = (page - 1) * limit;

    return this.contactUsModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
}
