import { Module } from '@nestjs/common';
import { TokenBlacklistService } from './token-blacklist.service';
import { TokenBlacklistController } from './token-blacklist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlacklistedToken, BlacklistedTokenSchema } from './entities/token-blacklist.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlacklistedToken.name, schema: BlacklistedTokenSchema },
    ]),
  ],
  controllers: [TokenBlacklistController],
  providers: [TokenBlacklistService],
  exports:[TokenBlacklistService]
})
export class TokenBlacklistModule {}
