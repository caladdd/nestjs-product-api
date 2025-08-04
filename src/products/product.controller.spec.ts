import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    getProducts: jest.fn(),
    createProduct: jest.fn(),
    deleteProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should call service.getProducts with filters and return result', async () => {
      const filters = { page: 1, limit: 5, name: 'Canon' };
      const result = [{ id: '1', name: 'Canon Camera' }];
      mockProductService.getProducts.mockResolvedValue(result);

      const response = await controller.getProducts(filters as any);

      expect(service.getProducts).toHaveBeenCalledWith(filters);
      expect(response).toBe(result);
    });
  });

  describe('deleteProduct', () => {
    it('should call service.deleteProduct with id and return result', async () => {
      const id = '123';
      const result = { deleted: true };
      mockProductService.deleteProduct.mockResolvedValue(result);

      const response = await controller.deleteProduct(id);

      expect(service.deleteProduct).toHaveBeenCalledWith(id);
      expect(response).toBe(result);
    });
  });
});
