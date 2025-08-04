import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductFilterDto } from 'src/common/pagination/product-filter.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async getProducts(query: ProductFilterDto) {
    const qb = this.productsRepository.createQueryBuilder('product');

    const { page = 1, limit = 5, name, category, minPrice, maxPrice } = query;

    qb.where('product.isDeleted = false'); // filter out deleted

    if (name) {
      qb.andWhere('LOWER(product.name) ILIKE :name', {
        name: `%${name.toLowerCase()}%`,
      });
    }

    if (category) {
      qb.andWhere('LOWER(product.category) ILIKE :category', {
        category: `%${category.toLowerCase()}%`,
      });
    }

    if (minPrice) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createProduct(productData: any) {
    await this.productsRepository.save(productData);
  }

  async findOne(query: Partial<Product>) {
    return this.productsRepository.findOne({ where: { ...query } });
  }

  async deleteProduct(id: string) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    product.isDeleted = true;
    return this.productsRepository.save(product);
  }
}
