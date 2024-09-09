// import { IsNotEmpty, IsString, IsArray, ValidateNested, IsEmail } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';
// import { Type } from 'class-transformer';

// class SocialMediaLinkDto {
//   @ApiProperty({ description: 'Type of the social media platform (e.g., Twitter, LinkedIn)', example: 'Twitter' })
//   @IsNotEmpty()
//   @IsString()
//   type: string;

//   @ApiProperty({ description: 'URL of the social media profile', example: 'https://twitter.com/instructor' })
//   @IsNotEmpty()
//   @IsString()
//   url: string;
// }

// export class CreateInstructorDto {
//   @ApiProperty({ description: 'First name of the instructor', example: 'John' })
//   @IsNotEmpty()
//   @IsString()
//   firstName: string;

//   @ApiProperty({ description: 'Last name of the instructor', example: 'Doe' })
//   @IsNotEmpty()
//   @IsString()
//   lastName: string;

//   @ApiProperty({ description: 'Email address of the instructor', example: 'john.doe@example.com' })
//   @IsNotEmpty()
//   @IsEmail()
//   email: string;

//   @ApiProperty({ description: 'Password for the instructor', example: 'password123' })
//   @IsNotEmpty()
//   @IsString()
//   password: string;

//   @ApiProperty({ description: 'Phone number of the instructor', example: '+1234567890' })
//   @IsNotEmpty()
//   @IsString()
//   phoneNumber: string;

//   @ApiProperty({ description: 'Bio of the instructor', example: 'Experienced instructor in computer science.' })
//   @IsNotEmpty()
//   @IsString()
//   bio: string;

//   @ApiProperty({ description: 'Array of social media links with type and URL', type: [SocialMediaLinkDto] })
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => SocialMediaLinkDto)
//   socialMediaLinks: SocialMediaLinkDto[];
// }
