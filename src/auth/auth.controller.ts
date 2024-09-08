import {
  Controller,
  Request,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ObjectId } from 'mongoose'; // Import ObjectId here
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login.auth.dto';
import { SignUpAuthDto } from './dto/signup.auth.dto';
import { VerifyOtpDto } from './dto/verify.otp.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';

@ApiTags('Authentication') // Swagger tag to group endpoints
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({
    status: 201,
    description: 'User signed up successfully.',
    schema: {
      example: {
        message: 'User created successfully',
        user: {
          id: '60b6b3c72b8e2c281b7bfabf',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
          role: 'user',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email or phone number already exists.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({
    type: SignUpAuthDto,
    description: 'Payload for signing up a new user',
  })
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: 201, description: 'User signed up successfully.' })
  @ApiResponse({
    status: 409,
    description: 'Email or phone number already exists.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async signUp(@Body() signUpAuthDto: SignUpAuthDto) {
    return this.authService.signUp(signUpAuthDto);
  }

  @Post('verify/otp')
  @ApiOperation({ summary: 'Verify OTP for email verification' })
  @ApiQuery({
    name: 'token',
    description: 'token received after login',
    
  })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified.',
    schema: {
      example: {
        message: 'Email verified successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired OTP token.',
  })
  @ApiBody({
    type: VerifyOtpDto,
    description: 'Payload for verifying OTP',
  })
  async verifyOtp(
    @Query('token') token: string,
    @Body() verifyOtpDto: VerifyOtpDto,
  ) {
    return this.authService.verifyOtp(token, verifyOtpDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully signed in with access and refresh tokens.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'd71b0484-e7b7-4eb4-82f1-1a134f3d3176',
        user: {
          id: '60b6b3c72b8e2c281b7bfabf',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid email or password',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      example: {
        statusCode: 500,
        message: 'An error occurred while processing your request',
      },
    },
  })
  @ApiBody({
    type: LoginAuthDto,
    description: 'Payload for signing in an existing user',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async signIn(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.signIn(loginAuthDto);
  }

  @Post('request/reset/password')
  @ApiOperation({ summary: 'Request a password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset request processed.',
    schema: {
      example: {
        message: 'Password reset instructions have been sent to your email',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Email not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Email not registered',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      example: {
        statusCode: 500,
        message: 'An error occurred while processing your request',
      },
    },
  })
  @ApiBody({
    schema: {
      example: {
        email: 'john.doe@example.com',
      },
    },
    description: 'User email for password reset request',
  })
  async requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset/password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful.',
    schema: {
      example: {
        message: 'Password has been changed, and a confirmation email will be sent',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid reset token or password.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid or expired reset token',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      example: {
        statusCode: 500,
        message: 'An error occurred while processing your request',
      },
    },
  })
  @ApiQuery({
    name: 'token',
    description: 'Reset token received via email within url',
    example: 'https://plan-iota.vercel.app/reset/password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmRjNTRiOTVlZWNiYjg3NDFjOWUxODIiLCJlbWFpbCI6Im1haG1vdWQuYW1tYXI1NjBAZ21haWwuY29tIiwib3RwIjoiODcwNTUxIiwiaWF0IjoxNzI1NzI0OTMyLCJleHAiOjE3MjU3MjU4MzJ9.bCOMmMIh0pr-N3NsTSS-gdaBDotuQuSBQpnIQ_LQOv4',
  })
  @ApiBody({
    schema: {
      example: {
        newPassword: 'NewSecurePass123!',
      },
    },
    description: 'New password for the user',
  })
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<any> {
    // Verify the token  first
    const user = await this.authService.getUserFromToken(token);
    await this.authService.resetPassword(user._id.toString(), newPassword);
    return {
      message: 'password has been changed and comfirmation mail will be sent',
    };
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
  @ApiOperation({ summary: 'Logout a user' })
  @ApiBearerAuth() // This indicates the endpoint requires a Bearer token
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or missing refresh token',
  })
  @ApiResponse({ status: 500, description: 'Failed to log out user' })
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
  @Post('refresh/token')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiQuery({
    name: 'refreshToken',
    description: 'Refresh token used to generate new access and refresh tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmRjNTRiOTVlZWNiYjg3NDFjOWUxODIiLCJlbWFpbCI6Im1haG1vdWQuYW1tYXI1NjBAZ21haWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzI1ODA4ODI0LCJleHAiOjE3MjY0MTM2MjR9.odtn1mnQc13IsB-LU6LXY8H2hkv5Op21TnoR7bsUoCI',
  })
  @ApiResponse({
    status: 200,
    description: 'New access and refresh tokens generated.',
  })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async refreshToken(@Query('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
