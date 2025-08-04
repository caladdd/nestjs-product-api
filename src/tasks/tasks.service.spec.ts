import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { ContentfulService } from '../contentful/contentful.service';
import { ProductService } from '../products/product.service';

describe('TasksService', () => {
  let service: TasksService;
  let contentfulService: { fetchProducts: jest.Mock };
  let productService: { findOne: jest.Mock; createProduct: jest.Mock };

  beforeEach(async () => {
    contentfulService = {
      fetchProducts: jest.fn(),
    };
    productService = {
      findOne: jest.fn(),
      createProduct: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: ContentfulService, useValue: contentfulService },
        { provide: ProductService, useValue: productService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleCron', () => {
    it('should fetch products and create them if not locally deleted', async () => {
      const products = [
        { id: '1', name: 'Product 1', isDeleted: false },
        { id: '2', name: 'Product 2', isDeleted: false },
      ];
      contentfulService.fetchProducts.mockResolvedValue(products);
      productService.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(undefined);
      productService.createProduct.mockResolvedValue(undefined);

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await service.handleCron();

      expect(contentfulService.fetchProducts).toHaveBeenCalled();
      expect(productService.findOne).toHaveBeenCalledTimes(2);
      expect(productService.createProduct).toHaveBeenCalledTimes(2);
      expect(logSpy).toHaveBeenCalledWith(
        '[SYNC] Starting scheduled Contentful sync...',
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SYNC] Synced 2 products'),
      );
      logSpy.mockRestore();
    });

    it('should skip locally deleted products', async () => {
      const products = [
        { id: '1', name: 'Product 1', isDeleted: false },
        { id: '2', name: 'Product 2', isDeleted: false },
      ];
      contentfulService.fetchProducts.mockResolvedValue(products);
      productService.findOne
        .mockResolvedValueOnce({ id: '1', isDeleted: true })
        .mockResolvedValueOnce(null);
      productService.createProduct.mockResolvedValue(undefined);

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await service.handleCron();

      expect(productService.createProduct).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith('Skipping locally deleted product 1');
      logSpy.mockRestore();
    });
  });

  describe('onModuleInit', () => {
    it('should trigger initial sync only once', async () => {
      const handleCronSpy = jest
        .spyOn(service, 'handleCron')
        .mockResolvedValue(undefined);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await service.onModuleInit();
      expect(handleCronSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        '[INIT] Triggering initial Contentful sync...',
      );

      // Call again, should not trigger sync
      await service.onModuleInit();
      expect(handleCronSpy).toHaveBeenCalledTimes(1);

      logSpy.mockRestore();
    });
  });
});
