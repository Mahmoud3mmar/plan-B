import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
} from 'class-validator';

export class LoginAuthDto {
    
  @ApiProperty({ description: 'The Login email of the user' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ description: 'The Login password of the user' })
  @IsString()
  readonly password: string;
}
