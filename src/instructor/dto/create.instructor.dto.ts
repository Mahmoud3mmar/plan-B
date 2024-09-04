import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Define the SocialMediaLinkDto class
class SocialMediaLinkDto {
  @ApiProperty({
    description: 'Type of the social media platform (e.g., Twitter, LinkedIn)',
    example: 'Twitter',
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    description: 'URL of the social media profile',
    example: 'https://twitter.com/instructor',
  })
  @IsNotEmpty()
  @IsString()
  url: string;
}

// Define the CreateInstructorDto class
export class CreateInstructorDto {
  @ApiProperty({
    description: 'Name of the instructor',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Bio of the instructor',
    example: 'Experienced instructor in computer science with 10 years of teaching experience.',
  })
  @IsNotEmpty()
  @IsString()
  bio: string;

  @ApiProperty({
    description: 'Array of social media links with type and URL',
    type: [SocialMediaLinkDto],
    example: [
      { type: 'Twitter', url: 'https://twitter.com/instructor' },
      { type: 'LinkedIn', url: 'https://linkedin.com/in/instructor' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialMediaLinkDto)
  socialMediaLinks: SocialMediaLinkDto[];
}
