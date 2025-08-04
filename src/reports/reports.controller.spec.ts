import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: ReportsService;

  const mockReportsService = {
    getDeletionPercentage: jest.fn(),
    getNonDeletedProductPercentage: jest.fn(),
    getAvgStockByCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: mockReportsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService);

    jest.clearAllMocks();
  });

  describe('getDeletedPercentage', () => {
    it('should return deletion percentage from service', async () => {
      const result = { percentage: 25, deleted: 10, total: 40 };
      mockReportsService.getDeletionPercentage.mockReturnValue(result);

      expect(controller.getDeletedPercentage()).toBe(result);
      expect(mockReportsService.getDeletionPercentage).toHaveBeenCalled();
    });
  });

  describe('getNonDeletedPercentage', () => {
    it('should call service with correct params (withPrice true)', () => {
      const result = { percentage: 80, filtered: 32, total: 40 };
      mockReportsService.getNonDeletedProductPercentage.mockReturnValue(result);

      expect(
        controller.getNonDeletedPercentage('true', '2024-01-01', '2024-01-31'),
      ).toBe(result);

      expect(
        mockReportsService.getNonDeletedProductPercentage,
      ).toHaveBeenCalledWith({
        withPrice: true,
        from: '2024-01-01',
        to: '2024-01-31',
      });
    });

    it('should call service with correct params (withPrice false)', () => {
      controller.getNonDeletedPercentage('false', '', '');
      expect(
        mockReportsService.getNonDeletedProductPercentage,
      ).toHaveBeenCalledWith({
        withPrice: false,
        from: '',
        to: '',
      });
    });

    it('should call service with undefined withPrice if not provided', () => {
      controller.getNonDeletedPercentage('', '2024-01-01', '2024-01-31');
      expect(
        mockReportsService.getNonDeletedProductPercentage,
      ).toHaveBeenCalledWith({
        withPrice: undefined,
        from: '2024-01-01',
        to: '2024-01-31',
      });
    });
  });

  describe('getAvgStockByCategory', () => {
    it('should return average stock by category from service', () => {
      const result = [
        { category: 'Camera', avgStock: '12.5' },
        { category: 'Laptop', avgStock: '8.2' },
      ];
      mockReportsService.getAvgStockByCategory.mockReturnValue(result);

      expect(controller.getAvgStockByCategory()).toBe(result);
      expect(mockReportsService.getAvgStockByCategory).toHaveBeenCalled();
    });
  });
});
