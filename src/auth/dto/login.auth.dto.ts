import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
} from 'class-validator';

export class LoginAuthDto {
    
  @ApiProperty({
    description: 'The email of the user for login',
    example: 'john.doe@example.com',
  })  @IsEmail()
   email: string;

  @ApiProperty({
    description: 'The password of the user for login',
    example: 'StrongPassword123!',
  })
  @IsString()
   password: string;
}
