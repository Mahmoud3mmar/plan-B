import { IsString, MinLength, MaxLength, IsEmail, IsEnum, ValidateIf, IsNotEmpty, ValidationArguments } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../user/common utils/Role.enum';

export class SignUpAuthDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the user' })
  email: string;

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  lastName: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number of the user' })
  phoneNumber: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password chosen by the user' })
  password: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password confirmation' })
  confirmPassword: string;

  @ApiProperty({ example: 'user', description: 'Role of the user (e.g., user, admin)' })
  role: string;


  
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