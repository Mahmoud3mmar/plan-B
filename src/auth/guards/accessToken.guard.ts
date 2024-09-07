import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { TokenBlacklistService } from '../../token-blacklist/token-blacklist.service';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  // constructor(
  //   private readonly jwtService: JwtService,
  //   private readonly TokenBlacklistService: TokenBlacklistService
  // ) {
  //   super();
  // }

  // async canActivate(context: ExecutionContext): Promise<boolean> {
  //   const request = context.switchToHttp().getRequest<Request>();

  //   const token = request.headers.authorization?.split(' ')[1];

  //   if (!token) {
  //     throw new UnauthorizedException('Access token is missing');
  //   }

  //   try {
  //     // Verify token
  //     const decoded = this.jwtService.verify(token);

  //     // Check if the token has been blacklisted
  //     const isTokenInvalidated = await this.TokenBlacklistService.isTokenBlacklisted(token);

  //     if (isTokenInvalidated) {
  //       throw new UnauthorizedException('Access token has been invalidated');
  //     }

  //     request.user = decoded;
  //     return true;
  //   } catch (error) {
  //     throw new UnauthorizedException('Invalid or expired access token');
  //   }
  // }
}