import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let repo: Repository<Product>;

  const mockRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getSql: jest.fn().mockReturnValue('SELECT * FROM product'),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repo = module.get(getRepositoryToken(Product));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated products', async () => {
    const result = await service.getProducts({ page: 1, limit: 5 });
    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 5,
      totalPages: 0,
    });
  });

  it('should filter products by name', async () => {
    const mockProducts = [{ id: '1', name: 'Test Product' }];
    mockRepo
      .createQueryBuilder()
      .getManyAndCount.mockResolvedValue([mockProducts, 1]);

    const result = await service.getProducts({
      page: 1,
      limit: 5,
      name: 'Test',
    });

    expect(mockRepo.createQueryBuilder().andWhere).toHaveBeenCalledWith(
      'LOWER(product.name) ILIKE :name',
      { name: '%test%' },
    );
    expect(result.data).toEqual(mockProducts);
  });

  it('should filter products by category', async () => {
    await service.getProducts({ page: 1, limit: 5, category: 'Electronics' });

    expect(mockRepo.createQueryBuilder().andWhere).toHaveBeenCalledWith(
      'LOWER(product.category) ILIKE :category',
      { category: '%electronics%' },
    );
  });

  it('should filter products by price range', async () => {
    await service.getProducts({
      page: 1,
      limit: 5,
      minPrice: 10,
      maxPrice: 100,
    });

    expect(mockRepo.createQueryBuilder().andWhere).toHaveBeenCalledWith(
      'product.price >= :minPrice',
      { minPrice: 10 },
    );
    expect(mockRepo.createQueryBuilder().andWhere).toHaveBeenCalledWith(
      'product.price <= :maxPrice',
      { maxPrice: 100 },
    );
  });

  it('should create a product', async () => {
    const productData = { name: 'New Product', price: 50 };
    mockRepo.save.mockResolvedValue(productData);

    await service.createProduct(productData);

    expect(mockRepo.save).toHaveBeenCalledWith(productData);
  });

  it('should find one product', async () => {
    const mockProduct = { id: '1', name: 'Test Product' };
    mockRepo.findOne.mockResolvedValue(mockProduct);

    const result = await service.findOne({ id: '1' });

    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual(mockProduct);
  });

  it('should soft delete a product', async () => {
    const mockProduct = { id: '1', name: 'Test Product', isDeleted: false };
    mockRepo.findOne.mockResolvedValue(mockProduct);
    mockRepo.save.mockResolvedValue({ ...mockProduct, isDeleted: true });

    const result = await service.deleteProduct('1');

    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(mockRepo.save).toHaveBeenCalledWith({
      ...mockProduct,
      isDeleted: true,
    });
    expect(result.isDeleted).toBe(true);
  });

  it('should throw NotFoundException when deleting non-existent product', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(service.deleteProduct('non-existent')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'non-existent' },
    });
  });
});
