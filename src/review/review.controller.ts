import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
  Put,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { CreateReviewDto } from './dto/create.review.dto';
import { RolesGuard } from '../auth/guards/role.guards';
import { Role } from '../user/common utils/Role.enum';
import { Roles } from '../auth/Roles.decorator';
import { UpdateReviewDto } from './dto/update.review.dto';

@ApiTags('review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // Get a review by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiResponse({ status: 200, description: 'Review found successfully.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async getReviewById(@Param('id') id: string) {
    const review = await this.reviewService.findReviewById(id);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  // Create a review for a course
  @Post(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a specific course' })
  @ApiResponse({ status: 201, description: 'Review created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only students can submit reviews.' })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  async createReview(
    @Param('courseId') courseId: string,
    @Body() createReviewDto: CreateReviewDto,
    @Request() req: any,
  ) {
    const userId = req.user.sub;

    return this.reviewService.createReview(createReviewDto, userId,courseId);
  }

  // Update review by ID
  @Put(':id')
  @UseGuards(AccessTokenGuard, RolesGuard) // Ensure that only students or authorized users can update reviews
  @Roles(Role.STUDENT)
  @ApiBearerAuth() // Specifies that the endpoint requires a JWT token
  @ApiOperation({ summary: 'Update an existing review by ID' })
  @ApiResponse({ status: 200, description: 'Review updated successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only the owner of the review can update it.',
  })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async updateReview(
    @Param('Reviewid') Reviewid: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;

    const review = await this.reviewService.findReviewById(Reviewid);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Ensure that only the student who created the review can update it
    if (review.student.toString() !== userId.toString()) {
      throw new ForbiddenException(
        'You are not authorized to update this review',
      );
    }

    return this.reviewService.updateReview(Reviewid, updateReviewDto);
  }




  
  // Delete review by ID
  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth() // Specifies that the endpoint requires a JWT token
  @ApiOperation({ summary: 'Delete a review by ID' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only the owner of the review can delete it.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })  // Ensure that only students or authorized users can delete reviews
  async deleteReview(@Param('Reviewid') Reviewid: string, @Request() req: any) {
    const userId = req.user.sub; // Extract user info from token (user._id, user.role, etc.)

    const review = await this.reviewService.findReviewById(Reviewid);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Ensure that only the student who created the review can delete it
    if (review.student.toString() !== userId.toString()) {
      throw new ForbiddenException(
        'You are not authorized to delete this review',
      );
    }

    return this.reviewService.deleteReview(Reviewid);
  }


  
}
