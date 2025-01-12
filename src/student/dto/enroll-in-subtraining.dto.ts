import { IsNotEmpty, IsString } from 'class-validator';

export class EnrollInSubTrainingDto {
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @IsNotEmpty()
  @IsString()
  subTrainingId: string;
} 