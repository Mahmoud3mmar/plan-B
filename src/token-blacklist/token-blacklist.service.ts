import { Injectable } from '@nestjs/common';
import { CreateTokenBlacklistDto } from './dto/create-token-blacklist.dto';
import { UpdateTokenBlacklistDto } from './dto/update-token-blacklist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BlacklistedToken, BlacklistedTokenDocument } from './entities/token-blacklist.entity';
import { Model } from 'mongoose';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectModel(BlacklistedToken.name) private readonly blacklistedTokenModel: Model<BlacklistedTokenDocument>,
  ) {}

  async blacklistToken(token: string, expiresIn: number): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000); // Convert seconds to milliseconds
    await this.blacklistedTokenModel.updateOne(
      { token },
      { token, expiresAt },
      { upsert: true }, // Insert if not exists
    );
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.blacklistedTokenModel.findOne({ token });
    if (blacklistedToken) {
      if (blacklistedToken.expiresAt > new Date()) {
        return true; // Token is still valid
      }
      await this.blacklistedTokenModel.deleteOne({ token }); // Remove expired token
    }
    return false;
  }
}