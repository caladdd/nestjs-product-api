import { ContentfulService } from './contentful.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ContentfulService', () => {
  let service: ContentfulService;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.CONTENTFUL_SPACE_ID = 'testSpace';
    process.env.CONTENTFUL_ACCESS_TOKEN = 'testToken';
    process.env.CONTENTFUL_ENVIRONMENT = 'testEnv';
    process.env.CONTENTFUL_CONTENT_TYPE = 'testType';
    service = new ContentfulService();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should fetch and map products correctly', async () => {
    const mockResponse = {
      data: {
        items: [
          {
            sys: {
              id: '1',
              locale: 'en-US',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-02T00:00:00Z',
            },
            fields: {
              sku: 'sku1',
              name: 'Product 1',
              brand: 'BrandA',
              model: 'ModelX',
              category: 'CategoryY',
              color: 'Red',
              price: '99.99',
              currency: 'USD',
              stock: '10',
            },
          },
        ],
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockResponse as any);

    const result = await service.fetchProducts();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://cdn.contentful.com/spaces/testSpace/environments/testEnv/entries',
      {
        params: {
          access_token: 'testToken',
          content_type: 'testType',
        },
      },
    );
    expect(result).toEqual([
      {
        id: '1',
        sku: 'sku1',
        name: 'Product 1',
        brand: 'BrandA',
        model: 'ModelX',
        category: 'CategoryY',
        color: 'Red',
        price: 99.99,
        currency: 'USD',
        stock: 10,
        locale: 'en-US',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
      },
    ]);
  });

  it('should handle missing optional fields gracefully', async () => {
    const mockResponse = {
      data: {
        items: [
          {
            sys: {
              id: '2',
              locale: 'en-US',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-02T00:00:00Z',
            },
            fields: {
              sku: 'sku2',
              name: 'Product 2',
              // brand, model, category, color, price, currency, stock missing
            },
          },
        ],
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockResponse as any);

    const result = await service.fetchProducts();

    expect(result[0]).toMatchObject({
      id: '2',
      sku: 'sku2',
      name: 'Product 2',
      brand: undefined,
      model: undefined,
      category: undefined,
      color: undefined,
      price: 0,
      currency: undefined,
      stock: 0,
      locale: 'en-US',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    });
  });

  it('should use default environment and content type if not set', async () => {
    delete process.env.CONTENTFUL_ENVIRONMENT;
    delete process.env.CONTENTFUL_CONTENT_TYPE;
    service = new ContentfulService();

    const mockResponse = { data: { items: [] } };
    mockedAxios.get.mockResolvedValueOnce(mockResponse as any);

    await service.fetchProducts();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://cdn.contentful.com/spaces/testSpace/environments/master/entries',
      {
        params: {
          access_token: 'testToken',
          content_type: 'product',
        },
      },
    );
  });

  it('should throw if axios fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    await expect(service.fetchProducts()).rejects.toThrow('Network error');
  });
});
