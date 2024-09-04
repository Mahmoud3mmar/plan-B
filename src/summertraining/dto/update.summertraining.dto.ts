import { PartialType } from '@nestjs/swagger';
import { CreateSummerTrainingDto } from './create.summertraining.dto';

export class UpdateSummertrainingDto extends PartialType(CreateSummerTrainingDto) {}
