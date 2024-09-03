import { IsString, MinLength, MaxLength, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../user/common utils/Role.enum';

export class SignUpAuthDto {

  @ApiProperty({ description: 'The email of the user' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ description: 'The first name of the user' })
  @IsString()
  @MinLength(1)
  readonly firstName: string;

  @ApiProperty({ description: 'The last name of the user' })
  @IsString()
  @MinLength(1)
  readonly lastName: string;

  @ApiProperty({ description: 'The phone number of the user' })
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  readonly phoneNumber: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @MinLength(4)
  // Uncomment the next line if you want to add a regex password validation
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'Password is too weak' })
  readonly password: string;

  @ApiProperty({ description: 'The role of the user' })
  @IsEnum(Role, { message: 'Role must be either ADMIN, USER, etc.' })
  readonly role: Role;
}
