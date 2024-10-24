import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseInterceptors, UploadedFile, Query, InternalServerErrorException, NotFoundException, HttpException, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Category } from './entities/category.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationQueryDto } from './dto/get.category.paginated';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guards';
import { Roles } from '../auth/Roles.decorator';
import { Role } from '../user/common utils/Role.enum';

@ApiTags('categories')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Post()
  @UseGuards(AccessTokenGuard,RolesGuard)
  @Roles(Role.ADMIN)  
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: Category })
  @ApiResponse({ status: 500, description: 'Failed to create category' })
  async createCategory(
    @Body('name') name: string,
    @Body('description') description?: string,
    @UploadedFile() image?: Express.Multer.File
  ): Promise<Category> {
    return this.categoryService.createCategory(name, description, image);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Get('sorted')
  @ApiOperation({ summary: 'Get all categories with pagination and sorting' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, type: String, enum: ['asc', 'desc'], description: 'Order to sort' })
  @ApiOkResponse({
    description: 'Successfully fetched categories',
    type: [Category], // Adjust based on the actual response type if different
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async getAllCategories(@Query() paginationQuery: PaginationQueryDto) {
    try {
      return await this.categoryService.getAllCategories(paginationQuery);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }


  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The category with its courses',
    schema: {
      example: {
        _id: '607d2f8f4f1a2c001f4b4d16',
        name: 'Category Name',
        courseCount: 5,
        courses: [
          {
            _id: '607d2f8f4f1a2c001f4b4d17',
            title: 'Course Title',
            description: 'Course Description'
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async getCategoryById(@Param('id') id: string): Promise<Category> {
    try {
      return await this.categoryService.getCategoryById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Failed to fetch category');
      }
    }
  }








  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    await this.categoryService.deleteCategory(id);
    return { message: 'Category and all associated courses and curriculum deleted successfully' };
  }
}



