import { IsString, MinLength, MaxLength, IsEmail, IsEnum, ValidateIf, IsNotEmpty, ValidationArguments } from 'class-validator';
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
  
  readonly password: string;


  @ApiProperty({ description: 'Confirm password for the user' })
  @IsString()
  @MinLength(4)
  @ValidateIf(o => o.password)
  @IsNotEmpty({ message: 'Confirm password should not be empty' })
  readonly confirmPassword: string;

  @ApiProperty({ description: 'The role of the user' })
  @IsEnum(Role, { message: 'Role must be either ADMIN, USER, etc.' })
  readonly role: Role;



  
}

// Custom validation class to match passwords
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'matchPasswords', async: false })
export class MatchPasswords implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const object = args.object as SignUpAuthDto;
    return object.password === confirmPassword;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password and confirm password must match';
  }
}