import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductFilterDto } from '../common/pagination/product-filter.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductDto } from './dto.ts/product.dto';
import { ApiGlobalResponses } from '../common/decorators/swagger-global-responses.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of products',
    type: ProductDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 5,
    description: 'Items per page (default 5)',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    example: 'Canon',
    description: 'Search by product name',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    example: 'Camera',
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    example: 100,
    description: 'Minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    example: 1000,
    description: 'Maximum price',
  })
  async getProducts(@Query() filters: ProductFilterDto) {
    return this.productService.getProducts(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiGlobalResponses()
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
