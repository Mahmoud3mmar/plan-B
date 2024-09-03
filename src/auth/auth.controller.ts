import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ObjectId } from 'mongoose';  // Import ObjectId here
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login.auth.dto';
import { SignUpAuthDto } from './dto/signup.auth.dto';
import { ResetPasswordDto } from './dto/reset.password.auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpAuthDto: SignUpAuthDto) {
    return this.authService.signUp(signUpAuthDto);
  }

  @Post('signin')
  async signIn(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.signIn(loginAuthDto);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto, // Create ResetPasswordDto with userId and newPassword fields
  ) {
    return this.authService.resetPassword(resetPasswordDto.userId, resetPasswordDto.newPassword);
  }

  @Post('logout')
  async logout(@Body('userId') userId: string) {
    return this.authService.logout(userId);
  }

  @Post('refresh-tokens')
  async refreshTokens(
    @Body('userId') userId: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}