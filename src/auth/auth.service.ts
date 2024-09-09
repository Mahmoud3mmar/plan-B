import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'; // Import ObjectId here

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../Email.Service';
import { SignUpAuthDto } from './dto/signup.auth.dto';
import { LoginAuthDto } from './dto/login.auth.dto';
import { VerifyOtpDto } from './dto/verify.otp.dto';
import { TokenBlacklistService } from '../token-blacklist/token-blacklist.service';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Student } from '../student/entities/student.entity';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Instructor.name) private readonly InstructorModel: Model<Instructor>,
    @InjectModel(Student.name) private readonly StudentModel: Model<Student>,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly TokenBlacklistService: TokenBlacklistService,
  ) {}

  async signUp(signUpAuthDto: SignUpAuthDto): Promise<{ message: string }> {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      confirmPassword,
      role,
    } = signUpAuthDto;

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    try {
      // Check for existing user
      const existingUser = await this.userModel.findOne({
        $or: [{ email }, { phoneNumber }],
      });

      if (existingUser) {
        throw new ConflictException('Email or phone number already exists');
      }

      // Hash the password
      // const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = new this.userModel({
        firstName,
        lastName,
        phoneNumber,
        email,
        password: hashedPassword,
        role,
      });

      // Save user to database
      await user.save();
      // // Create role-specific entity
      // if (role === 'INSTRUCTOR') {
      //   const instructor = new this.InstructorModel({
      //     ...savedUser.toObject(),
      //     bio: ' ', // Default or empty
      //     profileImage: '', // Default or empty
      //     socialMediaLinks: [], // Default or empty
      //     numberOfStudentsEnrolled: 0, // Default value
      //     numberOfCoursesProvided: 0, // Default value
      //     courses: [], // Default or empty
      //     students: [], // Default or empty
      //   });
      //   await instructor.save();
      // } else if (role === 'STUDENT') {
      //   const student = new this.StudentModel({
      //     ...savedUser.toObject(),
      //     coursesEnrolled: [], // Default or empty
      //   });
      //   await student.save();
      // }
      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();

      // Generate a JWT token containing the OTP and email
      const payload = { email, otp };
      const otpToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_VERIFY_SECRET, // Ensure this environment variable is correctly set
        expiresIn: '10m',
      });

      // Send OTP email for verification with the token
      await this.sendOtpEmail(user.email, otp, otpToken);

      return {
        message:
          'Signup successful! Please verify your email using the OTP sent to your email.',
      };
    } catch (error) {
      // Log the error to help diagnose the issue
      console.error('Error during signup:', error);

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error; // Propagate known exceptions
      }

      // Handle any unexpected errors
      throw new InternalServerErrorException('Failed to sign up user', error);
    }
  }

  async signIn(
    loginAuthDto: LoginAuthDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginAuthDto;

    try {
      // Validate the user credentials
      const user = await this.validateUser(email, password);

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Invalidate the previous refresh token
      await this.invalidateOldRefreshToken(user._id.toString());

      // Generate new access and refresh tokens
      const tokens = await this.generateTokens(
        user._id.toString(),
        user.email,
        user.role,
      );

      // Update the user's record with the new refresh token
      await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error; // Re-throw known authentication errors
      }

      // Handle unexpected errors
      throw new InternalServerErrorException(
        'Failed to sign in user',
        error.stack,
      );
    }
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

  async sendOtpEmail(
    email: string,
    otp: string,
    otpToken: string,
  ): Promise<void> {
    // const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${otpToken}`;
    const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${otpToken}`;

    const mailOptions = {
      from: process.env.NodeMailer_USER,
      to: email,
      subject: 'Verify Your Email: OTP Code',
      text: `Your OTP code is: ${otp}. Alternatively, you can verify your email by clicking the following link: ${verificationLink}`,
      html: `
        <h4>Email Verification</h4>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>You can also verify your email by clicking the link below:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This OTP is valid for 10 minutes.</p>
      `,
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

    // Generate the OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Create the reset token
    const token = this.jwtService.sign(
      { userId: user._id.toString(), email: user.email },
      { secret: process.env.JWT_RESET_SECRET, expiresIn: '15m' }, // Token expires in 15 minutes
    );

    const salt = await bcrypt.genSalt();
    const hashedToken = await bcrypt.hash(token, 10);
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    await user.save();

    // Construct the reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset/password?token=${token}`;

    // Set up email options
    const mailOptions = {
      from: process.env.NodeMailer_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>Dear ${user.email},</p>
        <p>We received a request to reset your password. Please click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Thank you!</p>
      `,
    };

    try {
      await this.mailService.transporter.sendMail(mailOptions);
      return {
        message:
          'If your email is valid, you will receive a password reset link.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send Password Reset Request email',
      );
    }
  }

  // async setResetPasswordToken(userId: string, token: string): Promise<void> {
  //   await this.userModel.findByIdAndUpdate(userId, {
  //     resetPasswordToken: token,
  //     resetPasswordExpires: new Date(Date.now() + 3600000),
  //   }); // Token expires in 1 hour
  // }
  async verifyOtp(
    token: string,
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ message: string }> {
    try {
      // Decode and verify the token
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_VERIFY_SECRET,
      });
      const { email, otp: tokenOtp } = decoded;

      // Validate OTP from request body
      const { otp: providedOtp } = verifyOtpDto;
      if (tokenOtp !== providedOtp) {
        throw new BadRequestException('Invalid OTP');
      }

      // Check if the user exists
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Mark user as verified
      if (user.isVerified) {
        return { message: 'Email is already verified' }; // Optional: Handle already verified case
      }

      user.isVerified = true;
      const verifiedUser =await user.save();
      // Create role-specific entity
      if (user.role === 'INSTRUCTOR') {
        const instructor = new this.InstructorModel({
          ...verifiedUser.toObject(),
          bio: ' ', // Default or empty
          profileImage: '', // Default or empty
          socialMediaLinks: [], // Default or empty
          numberOfStudentsEnrolled: 0, // Default value
          numberOfCoursesProvided: 0, // Default value
          courses: [], // Default or empty
          students: [], // Default or empty
        });
        await instructor.save();
      } else if (user.role === 'STUDENT') {
        const student = new this.StudentModel({
          ...verifiedUser.toObject(),
          coursesEnrolled: [], // Default or empty
        });
        await student.save();
      }
      
      return { message: 'Email successfully verified' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error; // Re-throw known errors
      }
      // Handle invalid or expired token errors
      throw new UnauthorizedException('Invalid or expired OTP token');
    }
  }

  // async verifyResetToken(token: string): Promise<User> {
  //   let decoded;

  //   // Verify and decode the JWT token
  //   try {
  //     decoded = this.jwtService.verify(token, {
  //       secret: process.env.JWT_RESET_SECRET,
  //     });
  //   } catch (error) {
  //     throw new BadRequestException('Invalid or expired token');
  //   }

  //   // Retrieve user by checking if the reset token is valid and not expired
  //   const user = await this.userModel.findOne({
  //     _id: decoded.userId,
  //     email: decoded.email,
  //     resetPasswordExpires: { $gt: new Date() }, // Ensure token is not expired
  //   });

  //   // Check if the user exists and the provided OTP matches
  //   if (!user) {
  //     throw new NotFoundException('User not found or token has expired');
  //   }

  //   // // Compare the provided token with the hashed token stored in the database
  //   // const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
  //   // if (!isTokenValid || decoded.otp !== otp) {
  //   //   throw new BadRequestException('Invalid token or OTP');
  //   // }

  //   return user;
  // }

  async getUserFromToken(token: string): Promise<User> {
    let decoded;

    // Verify and decode the JWT token
    try {
      decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_RESET_SECRET,
      });
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Retrieve user by checking if the reset token is valid and not expired
    const user = await this.userModel.findOne({
      _id: decoded.userId,
      email: decoded.email,
      resetPasswordExpires: { $gt: new Date() }, // Ensure token is not expired
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
    try {
      // Find the user
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if the token has expired
      if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
        throw new BadRequestException('Reset token has expired');
      }
      // Hash the new password and update the user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userModel.findByIdAndUpdate(userId, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      // Send confirmation email
      const mailOptions = {
        from: process.env.NodeMailer_USER,
        to: user.email,
        subject: 'Password Reset Successful',
        text: 'Your password has been successfully reset.',
      };

      await this.mailService.transporter.sendMail(mailOptions);
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new BadRequestException('Invalid or expired reset token');
      }
      throw new InternalServerErrorException(
        'Failed to reset password',
        error.stack,
      );
    }
  }

  async logout(
    userId: string,
    refreshToken: string,
    accessToken?: string,
  ): Promise<{ message: string }> {
    try {
      const userExists = await this.userModel.exists({ _id: userId });
      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      if (refreshToken) {
        await this.TokenBlacklistService.blacklistToken(
          refreshToken,
          30 * 24 * 60 * 60,
        );
      }

      if (accessToken) {
        await this.TokenBlacklistService.blacklistToken(accessToken, 60 * 60);
      }

      return { message: `User ${userId} has logged out successfully.` };
    } catch (error) {
      throw new InternalServerErrorException('Failed to log out user');
    }
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const userId = decoded.userId;

      // Optionally, check if the refresh token is in a blacklist
      const isTokenBlacklisted =
        await this.TokenBlacklistService.isTokenBlacklisted(refreshToken);
      if (isTokenBlacklisted) {
        throw new UnauthorizedException('Refresh token has been invalidated');
      }

      // Generate new tokens
      const newAccessToken = this.jwtService.sign(
        { userId },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '5h' },
      );
      const newRefreshToken = this.jwtService.sign(
        { userId },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      );

      // Optionally, update the refresh token in the database if needed

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '5h' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    // Update the user's refresh token in the database
    await this.userModel.findByIdAndUpdate(userId, { refreshToken });
  }
}
