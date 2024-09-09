import { IsEmail, IsNotEmpty, IsString, Matches, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../user/common utils/Role.enum';

export class SignUpAuthDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number of the user' })
  @IsNotEmpty()
  @IsString()
  // @Matches(/^\+?\d{10,15}$/, { message: 'Phone number must be a valid international phone number' })
  phoneNumber: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password chosen by the user' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password confirmation' })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;

  @ApiProperty({ example: 'user', description: 'Role of the user (e.g., user, admin)' })
  @IsNotEmpty()
  @IsString()
  @IsEnum(Role) // Assuming Role is an enum with values like 'USER' and 'ADMIN'
  role: Role;
}


// // Custom validation class to match passwords
// import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

// @ValidatorConstraint({ name: 'matchPasswords', async: false })
// export class MatchPasswords implements ValidatorConstraintInterface {
//   validate(confirmPassword: string, args: ValidationArguments) {
//     const object = args.object as SignUpAuthDto;
//     return object.password === confirmPassword;
//   }

//   defaultMessage(args: ValidationArguments) {
//     return 'Password and confirm password must match';
//   }
// }