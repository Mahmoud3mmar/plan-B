import { ApiProperty } from '@nestjs/swagger';
import { trainingLevel } from '../entities/subtraining.entity';
import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber, IsEnum } from 'class-validator';

export class PurchaseSubTrainingDto {
  @IsNotEmpty()
  @IsString()
  summerTrainingId: string;

  @IsNotEmpty()
  @IsString()
  subTrainingId: string;

  @IsNotEmpty()
  @IsString()
  university: string;

  @ApiProperty({ description: 'Level of the sub-training', enum: trainingLevel })
  @IsNotEmpty()
  @IsEnum(trainingLevel)
  level: trainingLevel;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  customerFirstName: string;

  @IsNotEmpty()
  @IsString()
  customerLastName: string;

  @IsNotEmpty()
  @IsString()
  nationality: string; // The name of the nationality input by the user

  @IsNotEmpty()
//   @IsPhoneNumber()
  customerMobile: string;

  @IsNotEmpty()
  @IsString()
  faculty: string;
}