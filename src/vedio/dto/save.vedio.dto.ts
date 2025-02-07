import { IsString, IsNotEmpty } from 'class-validator';

export class SaveVedioDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  duration: string;  // Duration as a string in mm:ss format

  @IsNotEmpty()
  @IsString()
  videoUrl:string

}
