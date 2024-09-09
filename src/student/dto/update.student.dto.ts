import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateStudentDto {
  @ApiProperty({
    description: 'URL of the profile image.',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({
    description: 'List of IDs of courses the student is enrolled in.',
    example: ['603c72ef4f1a2c001f647c3f'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coursesEnrolled?: Types.ObjectId[];
}
