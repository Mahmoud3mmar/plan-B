import { IsNotEmpty, IsString, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class SocialMediaLinkDto {
  @ApiProperty({ description: 'Type of the social media platform (e.g., twitter, linkedin)' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: 'URL of the social media profile' })
  @IsNotEmpty()
  @IsString()
  url: string;
}

export class CreateInstructorDto {
  @ApiProperty({ description: 'Name of the instructor' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Bio of the instructor' })
  @IsNotEmpty()
  @IsString()
  bio: string;

  @ApiProperty({ description: 'Array of social media links with type and URL' })
  @IsArray()
  @IsObject({ each: true })
  socialMediaLinks: SocialMediaLinkDto[];
}
