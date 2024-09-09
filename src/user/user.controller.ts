import { Controller, Delete, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('user')
@ApiBearerAuth() // Indicates that the endpoint requires a Bearer token for authorization
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Delete()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Deletes the user based on the ID extracted from the JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted.',
    schema: {
      example: {
        message: 'User successfully deleted',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User ID not found or invalid token.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async deleteUser(@Request() req: any): Promise<{ message: string }> {
    const userId = req.user.sub; // Extract user ID from the request
    if (!userId) {
      throw new UnauthorizedException('User ID not found');
    }

    await this.userService.deleteUser(userId);
    return { message: 'User successfully deleted' };
  }
}
