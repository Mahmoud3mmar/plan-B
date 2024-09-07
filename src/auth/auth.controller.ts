import { Controller,Request,Get, Post, Body, Patch, Param, Delete, Query, UseGuards, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ObjectId } from 'mongoose';  // Import ObjectId here
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login.auth.dto';
import { SignUpAuthDto } from './dto/signup.auth.dto';
import { VerifyOtpDto } from './dto/verify.otp.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: 201, description: 'User signed up successfully.' })
  @ApiResponse({ status: 409, description: 'Email or phone number already exists.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async signUp(@Body() signUpAuthDto: SignUpAuthDto) {
    return this.authService.signUp(signUpAuthDto);
  }

  @Post('verify/otp')
  @ApiOperation({ summary: 'Verify OTP for email verification' })
  @ApiResponse({ status: 200, description: 'Email successfully verified.' })
  @ApiResponse({ status: 400, description: 'Invalid OTP.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP token.' })
  async verifyOtp(@Query('token') token: string, @Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(token, verifyOtpDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiResponse({ status: 200, description: 'Successfully signed in with access and refresh tokens.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async signIn(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.signIn(loginAuthDto);
  }

  @Post('request/reset/password')
  @ApiOperation({ summary: 'Request a password reset' })  
  @ApiResponse({ status: 200, description: 'Password reset request processed.' })
  @ApiResponse({ status: 404, description: 'Email not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset/password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successful.' })
  @ApiResponse({ status: 400, description: 'Invalid reset token or password.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string
  ): Promise<any> {
    // Verify the token  first
    const user = await this.authService.getUserFromToken(token);
    await this.authService.resetPassword(user._id.toString(), newPassword);
    return { message: 'password has been changed and comfirmation mail will be sent' };
  }
  // @Post('logout')
  // @ApiOperation({ summary: 'Logout user and invalidate refresh token' })
  // @ApiResponse({ status: 200, description: 'Logout successful.' })
  // @ApiResponse({ status: 404, description: 'User not found.' })
  // @ApiResponse({ status: 500, description: 'Internal server error.' })
  // @Post('logout')
  // @UseGuards(AccessTokenGuard)
  // async logout(@Request() Req): Promise<any> {
  //   const userId = Req.user['sub']; // Extract user ID from the request
  //   const refreshToken = Req.headers['authorization']?.split(' ')[1]; // Extract refresh token if provided

  //   if (!refreshToken) {
  //     throw new BadRequestException('Refresh token is required');
  //   }

  //   await this.authService.logout(userId, refreshToken);

  //   return { message: 'Logout successful' };
  // }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  async logout(@Request() req): Promise<{ message: string }> {
    const userId = req.user.userId; // Assuming `sub` contains the user ID
    const refreshToken = req.headers['refreshtoken'] as string; // Assuming you send the refresh token in the headers

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    await this.authService.logout(userId, refreshToken);

    return { message: 'Logout successful' };
  }

  @Post('refresh/token')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'New access and refresh tokens generated.' })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async refreshToken(@Query('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  
}