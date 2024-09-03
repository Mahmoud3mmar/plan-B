import { PartialType } from '@nestjs/swagger';
import { CreateSummertrainingDto } from './create-summertraining.dto';

export class UpdateSummertrainingDto extends PartialType(CreateSummertrainingDto) {}
