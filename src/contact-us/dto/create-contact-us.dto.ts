import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateContactUsDto {
  @ApiProperty({ description: 'Name of the person contacting' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email of the person contacting' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number of the person contacting' })
  @IsNotEmpty()
  @IsPhoneNumber(null) // You can specify a country code if needed
  phoneNumber: string;

  @ApiProperty({ description: 'Message from the person contacting' })
  @IsNotEmpty()
  @IsString()
  msg: string;
}
