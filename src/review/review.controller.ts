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
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { CreateReviewDto } from './dto/create.review.dto';
import { RolesGuard } from '../auth/guards/role.guards';
import { Role } from '../user/common utils/Role.enum';
import { Roles } from '../auth/Roles.decorator';
import { UpdateReviewDto } from './dto/update.review.dto';
import { Review } from './entities/review.entity';
import { PaginationDto } from './dto/get.all.reviews.paginated.dto';

@ApiTags('review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // Get a review by ID
  @Get(':ReviewId')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiResponse({ status: 200, description: 'Review found successfully.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async getReviewById(@Param('ReviewId') ReviewId: string) {
    const review = await this.reviewService.findReviewById(ReviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



@Get('sorted/:courseId')
@UseGuards(AccessTokenGuard)
@ApiOperation({ summary: 'Get all reviews for a specific course with pagination' })
@ApiParam({
  name: 'courseId',
  type: String,
  description: 'The ID of the course to get reviews for',
})
@ApiQuery({
  name: 'page',
  type: Number,
  required: false,
  description: 'The page number for pagination',
  example: 1,
})
@ApiQuery({
  name: 'limit',
  type: Number,
  required: false,
  description: 'The number of reviews per page',
  example: 10,
})
@ApiResponse({
  status: 200,
  description: 'List of reviews for the specified course',
  schema: {
    type: 'object',
    properties: {
      totalReviews: {
        type: 'number',
        description: 'Total number of reviews for the course',
      },
      reviews: {
        type: 'array',
        items: { $ref: getSchemaPath(Review) },
        description: 'Array of reviews',
      },
      totalPages: {
        type: 'number',
        description: 'Total number of pages available',
      },
      currentPage: {
        type: 'number',
        description: 'Current page number',
      },
    },
  },
})
@ApiResponse({
  status: 404,
  description: 'Course not found',
})
@ApiResponse({
  status: 400,
  description: 'Invalid pagination parameters',
})
async getReviewsByCourse(
  @Param('courseId') courseId: string,
  @Query() paginationDto: PaginationDto,
) {
  return this.reviewService.getReviewsByCourse(courseId, paginationDto);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Post(':courseId')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Create a review for a course' })
  @ApiBody({
    description: 'Review details',
    type: CreateReviewDto,
  })
  @ApiResponse({ status: 201, description: 'Review created successfully', type: CreateReviewDto })
  @ApiResponse({ status: 404, description: 'Course or student not found' })
  @ApiResponse({ status: 409, description: 'Conflict, student not enrolled in the course' })
  async createReview(
    @Request() req: any,
    @Param('courseId') courseId: string,
    @Body() createReviewDto: CreateReviewDto
  ) {
    const studentId = req.user.sub; // Extract user ID from the JWT token
    return this.reviewService.createReview(
      studentId,
      courseId,
      createReviewDto.comment,
      createReviewDto.rating
    );
  }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // Update review by ID
  // @Put(':id')
  // @UseGuards(AccessTokenGuard, RolesGuard) // Ensure that only students or authorized users can update reviews
  // @Roles(Role.STUDENT)
  // @ApiBearerAuth() // Specifies that the endpoint requires a JWT token
  // @ApiOperation({ summary: 'Update an existing review by ID' })
  // @ApiResponse({ status: 200, description: 'Review updated successfully.' })
  // @ApiResponse({
  //   status: 403,
  //   description: 'Forbidden. Only the owner of the review can update it.',
  // })
  // @ApiResponse({ status: 404, description: 'Review not found.' })
  // async updateReview(
  //   @Param('Reviewid') Reviewid: string,
  //   @Body() updateReviewDto: UpdateReviewDto,
  //   @Req() req: any,
  // ) {
  //   const userId = req.user.sub;

  //   const review = await this.reviewService.findReviewById(Reviewid);

  //   if (!review) {
  //     throw new NotFoundException('Review not found');
  //   }

  //   // Ensure that only the student who created the review can update it
  //   if (review.student.toString() !== userId.toString()) {
  //     throw new ForbiddenException(
  //       'You are not authorized to update this review',
  //     );
  //   }

  //   return this.reviewService.updateReview(Reviewid, updateReviewDto);
  // }




  
  // // Delete review by ID
  // @Delete(':id')
  // @UseGuards(AccessTokenGuard, RolesGuard)
  // @Roles(Role.STUDENT)
  // @ApiBearerAuth() // Specifies that the endpoint requires a JWT token
  // @ApiOperation({ summary: 'Delete a review by ID' })
  // @ApiResponse({ status: 200, description: 'Review deleted successfully.' })
  // @ApiResponse({ status: 403, description: 'Forbidden. Only the owner of the review can delete it.' })
  // @ApiResponse({ status: 404, description: 'Review not found.' })  // Ensure that only students or authorized users can delete reviews
  // async deleteReview(@Param('Reviewid') Reviewid: string, @Request() req: any) {
  //   const userId = req.user.sub; // Extract user info from token (user._id, user.role, etc.)

  //   const review = await this.reviewService.findReviewById(Reviewid);

  //   if (!review) {
  //     throw new NotFoundException('Review not found');
  //   }

  //   // Ensure that only the student who created the review can delete it
  //   if (review.student.toString() !== userId.toString()) {
  //     throw new ForbiddenException(
  //       'You are not authorized to delete this review',
  //     );
  //   }

  //   return this.reviewService.deleteReview(Reviewid);
  // }


  
}
