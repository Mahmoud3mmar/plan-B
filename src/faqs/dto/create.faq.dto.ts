import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFaqDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  @IsString()
  answer: string;

  @IsOptional()
  course?: Types.ObjectId; // Reference to Course document, optional for creation
}