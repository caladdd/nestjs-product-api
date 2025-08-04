import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiGlobalResponses } from '../common/decorators/swagger-global-responses.decorator';

@ApiTags('Reports')
@ApiGlobalResponses()
@UseGuards(JwtAuthGuard)
@Controller('/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('deleted-percentage')
  @ApiResponse({
    status: 200,
    description: 'Percentage of deleted products',
    schema: {
      example: {
        percentage: 25,
        deleted: 10,
        total: 40,
      },
    },
  })
  getDeletedPercentage() {
    return this.reportsService.getDeletionPercentage();
  }

  @Get('non-deleted-percentage')
  @ApiQuery({ name: 'withPrice', required: false, description: 'true | false' })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Percentage of non-deleted products with filters',
    schema: {
      example: {
        percentage: 80,
        filtered: 32,
        total: 40,
      },
    },
  })
  getNonDeletedPercentage(
    @Query('withPrice') withPrice: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getNonDeletedProductPercentage({
      withPrice:
        withPrice === 'true' ? true : withPrice === 'false' ? false : undefined,
      from,
      to,
    });
  }

  @Get('avg-stock-by-category')
  @ApiResponse({
    status: 200,
    description: 'Average stock grouped by category',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          avgStock: { type: 'string' },
        },
      },
      example: [
        { category: 'Camera', avgStock: '12.5' },
        { category: 'Laptop', avgStock: '8.2' },
      ],
    },
  })
  getAvgStockByCategory() {
    return this.reportsService.getAvgStockByCategory();
  }
}
