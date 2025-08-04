import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { ObjectLiteral, Repository } from 'typeorm';

type MockRepo<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const mockRepo = (): MockRepo => ({
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('ReportsService', () => {
  let service: ReportsService;
  let repo: MockRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Product), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    repo = module.get(getRepositoryToken(Product));
  });

  describe('getDeletionPercentage', () => {
    it('should return 0 percentage if total is 0', async () => {
      repo!.count!.mockResolvedValueOnce(0);
      repo.count?.mockResolvedValueOnce(0);
      const result = await service.getDeletionPercentage();
      expect(result).toEqual({ percentage: 0, deleted: 0, total: 0 });
    });

    it('should return correct percentage', async () => {
      repo.count?.mockResolvedValueOnce(10); // total
      repo.count?.mockResolvedValueOnce(2); // deleted
      const result = await service.getDeletionPercentage();
      expect(result).toEqual({ percentage: 20, deleted: 2, total: 10 });
    });
  });

  describe('getNonDeletedProductPercentage', () => {
    let qb: any;

    beforeEach(() => {
      qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
      };
      repo.createQueryBuilder!.mockReturnValue(qb);
    });

    it('should return 0 percentage if total is 0', async () => {
      repo.count?.mockResolvedValueOnce(0);
      qb.getCount.mockResolvedValueOnce(0);
      const result = await service.getNonDeletedProductPercentage({});
      expect(result).toEqual({ percentage: 0, filtered: 0, total: 0 });
    });

    it('should filter by withPrice true', async () => {
      repo.count?.mockResolvedValueOnce(5);
      qb.getCount.mockResolvedValueOnce(3);
      const params = { withPrice: true };
      const result = await service.getNonDeletedProductPercentage(params);
      expect(qb.andWhere).toHaveBeenCalledWith('product.price IS NOT NULL');
      expect(result).toEqual({ percentage: 60, filtered: 3, total: 5 });
    });

    it('should filter by withPrice false', async () => {
      repo.count?.mockResolvedValueOnce(5);
      qb.getCount.mockResolvedValueOnce(2);
      const params = { withPrice: false };
      const result = await service.getNonDeletedProductPercentage(params);
      expect(qb.andWhere).toHaveBeenCalledWith('product.price IS NULL');
      expect(result).toEqual({ percentage: 40, filtered: 2, total: 5 });
    });

    it('should filter by date range', async () => {
      repo.count?.mockResolvedValueOnce(5);
      qb.getCount.mockResolvedValueOnce(1);
      const params = { from: '2024-01-01', to: '2024-01-31' };
      const result = await service.getNonDeletedProductPercentage(params);
      expect(qb.andWhere).toHaveBeenCalledWith(
        'product.createdAt BETWEEN :from AND :to',
        { from: '2024-01-01', to: '2024-01-31' },
      );
      expect(result).toEqual({ percentage: 20, filtered: 1, total: 5 });
    });
  });

  describe('getAvgStockByCategory', () => {
    it('should return grouped average stock', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ category: 'A', avgStock: 10 }]),
      };
      repo.createQueryBuilder?.mockReturnValue(qb);
      const result = await service.getAvgStockByCategory();
      expect(result).toEqual([{ category: 'A', avgStock: 10 }]);
      expect(qb.where).toHaveBeenCalledWith('product.isDeleted = false');
      expect(qb.groupBy).toHaveBeenCalledWith('product.category');
    });
  });
});
