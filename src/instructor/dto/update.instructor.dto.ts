import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SocialMediaLinkDto {
  @ApiProperty({
    description: 'Type of the social media platform (e.g., Twitter, LinkedIn)',
    example: 'Twitter',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;



  @ApiProperty({ description: 'Profile image URL', required: false })
  @IsString()
  @IsOptional()
  profileImage?: string;
  @ApiProperty({
    description: 'URL of the social media profile',
    example: 'https://twitter.com/instructor',
    required: false,
  })
  @IsOptional()
  @IsString()
  url?: string;


  
}

export class UpdateInstructorDto {
  @ApiProperty({
    description: 'Name of the instructor',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Bio of the instructor',
    example: 'Experienced instructor in computer science with 10 years of teaching experience.',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'Array of social media links with type and URL',
    type: [SocialMediaLinkDto],
    example: [
      { type: 'Twitter', url: 'https://twitter.com/instructor' },
      { type: 'LinkedIn', url: 'https://linkedin.com/in/instructor' },
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialMediaLinkDto)
  socialMediaLinks?: SocialMediaLinkDto[];
}
