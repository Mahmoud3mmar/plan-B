import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';  // Import ObjectId here

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/Email.Service';
import { SignUpAuthDto } from './dto/signup.auth.dto';
import { LoginAuthDto } from './dto/login.auth.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}


  async signUp(signUpAuthDto: SignUpAuthDto): Promise<User> {
    const { firstName,lastName,phoneNumber, email, password, role } = signUpAuthDto;

    // Check for existing user
    try {
      const existingUser = await this.userModel.findOne({
        $or: [{ email }, { phoneNumber }],
      });

      if (existingUser) {
      
          throw new ConflictException('Email already exists');
        
        
      }

      // Hash the password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = new this.userModel({
        firstName,
        lastName,
        phoneNumber,
        email,
        password: hashedPassword,
        role,
        otpExpiration: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
      });

      // Save user to database
      const newUser = await user.save();

      return newUser;
    } catch (error) {
      throw new InternalServerErrorException('Failed to sign up user');
    }
  }

  async signIn(loginAuthDto: LoginAuthDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginAuthDto;
    const user = await this.validateUser(email, password);

    // Invalidate the previous refresh token
    await this.invalidateOldRefreshToken(user._id.toString());

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);

    // Update the user's record with the new refresh token
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return tokens;
  }

  async invalidateOldRefreshToken(userId: string): Promise<void> {
    // Fetch the user and check if there is an existing refresh token
    const user = await this.userModel.findById(userId);

    if (user && user.refreshToken) {
      // Invalidate the old refresh token
      user.refreshToken = null;
      await user.save();
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ email });

    // Validate user existence and password
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    throw new UnauthorizedException('Please check your login credentials');
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: process.env.NodeMailer_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    };

    try {
      await this.mailService.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }

  async requestPasswordReset(email: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return; // Handle silently for security reasons
    }

    const otp = crypto.randomInt(100000, 999999).toString(); 

    const token = this.jwtService.sign(
      { userId: user._id.toString(), email: user.email, otp },
      { secret: process.env.JWT_RESET_SECRET, expiresIn: '15m' } // Token expires in 15 minutes
    );
    const hashedToken = await bcrypt.hash(token, 10);
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    await user.save();

    const mailOptions = {
      from: process.env.NodeMailer_USER,
      to: user.email,
      subject: 'Password Reset Request',
      text: `YOUR OTP Is :${otp}`,
    };

    try {
      await this.mailService.transporter.sendMail(mailOptions);
      return { message: 'If your email is valid, you will receive a password reset link.', resetToken: token };
    } catch (error) {
      throw new InternalServerErrorException('Failed to send Password Reset Request email');
    }
  }

  async setResetPasswordToken(userId: string, token: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { resetPasswordToken: token, resetPasswordExpires: new Date(Date.now() + 3600000) }); // Token expires in 1 hour
  }

  async verifyResetToken(token: string, otp: string): Promise<User> {
    let decoded;

    // Verify and decode the JWT token
    try {
      decoded = this.jwtService.verify(token, { secret: process.env.JWT_RESET_SECRET });
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Retrieve user by checking if the reset token is valid and not expired
    const user = await this.userModel.findOne({
      _id: decoded.userId,
      email: decoded.email,
      resetPasswordExpires: { $gt: new Date() } // Ensure token is not expired
    });

    // Check if the user exists and the provided OTP matches
    if (!user) {
      throw new NotFoundException('User not found or token has expired');
    }

    // Compare the provided token with the hashed token stored in the database
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid || decoded.otp !== otp) {
      throw new BadRequestException('Invalid token or OTP');
    }

    return user;
  }

  async getUserFromToken(token: string): Promise<User> {
    let decoded;

    // Verify and decode the JWT token
    try {
      decoded = this.jwtService.verify(token, { secret: process.env.JWT_RESET_SECRET });
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Retrieve user by checking if the reset token is valid and not expired
    const user = await this.userModel.findOne({
      _id: decoded.userId,
      email: decoded.email,
      resetPasswordExpires: { $gt: new Date() } // Ensure token is not expired
    });

    // Check if the user exists
    if (!user) {
      throw new NotFoundException('User not found or token has expired');
    }

    // Compare the provided token with the hashed token stored in the database
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid) {
      throw new BadRequestException('Invalid token or OTP');
    }

    return user;
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    // Optionally, notify the user via email
    const user = await this.userModel.findById(userId);
    const mailOptions = {
      from: process.env.NodeMailer_USER,
      to: user.email,
      subject: 'Password Reset Successful',
      text: 'Password Reset Successful',
    };

    try {
      await this.mailService.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send confirmation email');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    try {
      // Update the user's record to remove the refresh token
      const result = await this.userModel.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });

      if (!result) {
        throw new NotFoundException('User not found');
      }

      // Return a success message
      return { message: 'Logout successful' };
    } catch (error) {
      // Return a user-friendly message without exposing internal details
      throw new InternalServerErrorException('Failed to logout. Please try again later.');
    }
  }

  async refreshTokens(userId: string, providedRefreshToken: string) {
    // Fetch user from the database by UUID
    const user = await this.userModel.findById(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    // Validate the provided refresh token
    const isTokenValid = await bcrypt.compare(providedRefreshToken, user.refreshToken);
    if (!isTokenValid) {
      throw new ForbiddenException('Access denied');
    }

    // Generate new access and refresh tokens
    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);

    // Update the user's record with the new refresh token
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return tokens;
  }

  async generateTokens(userId: string, email: string, role: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign(
      { userId, email, role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' } // Access token expires in 15 minutes
    );

    const refreshToken = this.jwtService.sign(
      { userId, email, role },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' } // Refresh token expires in 7 days
    );

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Update the user's refresh token in the database
    await this.userModel.findByIdAndUpdate(userId, { refreshToken });
  }
}

