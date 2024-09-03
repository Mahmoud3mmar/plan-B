import { Module } from '@nestjs/common';
import { SummertrainingService } from './summertraining.service';
import { SummertrainingController } from './summertraining.controller';

@Module({
  controllers: [SummertrainingController],
  providers: [SummertrainingService],
})
export class SummertrainingModule {}
