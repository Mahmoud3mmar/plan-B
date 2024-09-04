

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';


export class UpdateFaqDto {
    @IsOptional()
    @IsString()
    question?: string;
  
    @IsOptional()
    @IsString()
    answer?: string;
  
    @IsOptional()
    course?: Types.ObjectId; // Reference to Course document, optional for update
  }