import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { ContactUs } from './entities/contact-us.entity';
import { GetContactUsDto } from './dto/update-contact-us.dto';

@Controller('contact/us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  async create(@Body() createContactUsDto: CreateContactUsDto) {
    return this.contactUsService.create(createContactUsDto);
  }

  @Get()
  async findAll(@Query() GetContactUsDto: GetContactUsDto): Promise<ContactUs[]> {
    return this.contactUsService.findAll(GetContactUsDto);
  }
}
