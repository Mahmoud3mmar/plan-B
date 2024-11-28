import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';

@Module({
  providers: [AwsService],
  exports: [AwsService], // Export the service to use it in other modules
})
export class AwsModule {}   