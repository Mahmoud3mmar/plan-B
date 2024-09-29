// create-curriculum-block.dto.ts
import { IsString, IsBoolean, IsNotEmpty, IsArray } from 'class-validator';

export class CreateCurriculumBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;


  @IsNotEmpty()
  numberOfLessons: number;

  @IsBoolean()
  isPreview: boolean;

  @IsString()
  @IsNotEmpty()
  courseId: string; // The course to which the block belongs, curriculum will be fetched
}
