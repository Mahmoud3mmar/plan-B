import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../user/entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './accessToken.strategy';
import { RefreshTokenStrategy } from './refreshToken.strategy';
import { MailService } from '../Email.Service';
import { TokenBlacklistModule } from '../token-blacklist/token-blacklist.module';
import { Instructor, InstructorSchema } from '../instructor/entities/instructor.entity';
import { Student, StudentSchema } from '../student/entities/student.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Student.name, schema: StudentSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.register({}),
    TokenBlacklistModule, // Add TokenBlacklistModule here

  ],
  providers: [
    AuthService,
    MailService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    
  ],
  controllers: [AuthController],
  exports:[AuthService]

})
export class AuthModule {}
