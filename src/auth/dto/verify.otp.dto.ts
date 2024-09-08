import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {


  @ApiProperty({
    example: '123456',
    description: 'One-Time Password (OTP) sent to the user',
    minLength: 6,
    maxLength: 6,
    type: String,
  })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits long' })
  otp: string;
}
