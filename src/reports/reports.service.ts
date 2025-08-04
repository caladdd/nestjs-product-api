import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async getDeletionPercentage(): Promise<{
    percentage: number;
    deleted: number;
    total: number;
  }> {
    const total = await this.repo.count();
    const deleted = await this.repo.count({ where: { isDeleted: true } });
    return {
      percentage: total === 0 ? 0 : (deleted / total) * 100,
      deleted,
      total,
    };
  }

  async getNonDeletedProductPercentage({
    withPrice,
    from,
    to,
  }: {
    withPrice?: boolean;
    from?: string;
    to?: string;
  }): Promise<{ percentage: number; filtered: number; total: number }> {
    const total = await this.repo.count({ where: { isDeleted: false } });

    const qb = this.repo
      .createQueryBuilder('product')
      .where('product.isDeleted = false');

    if (withPrice !== undefined) {
      qb.andWhere(`product.price IS${withPrice ? ' NOT' : ''} NULL`);
    }

    if (from && to) {
      qb.andWhere('product.createdAt BETWEEN :from AND :to', { from, to });
    }

    const count = await qb.getCount();
    return {
      percentage: total === 0 ? 0 : (count / total) * 100,
      filtered: count,
      total,
    };
  }

  async getAvgStockByCategory(): Promise<
    { category: string; avgStock: number }[]
  > {
    return await this.repo
      .createQueryBuilder('product')
      .where('product.isDeleted = false')
      .select('product.category', 'category')
      .addSelect('AVG(product.stock)', 'avgStock')
      .groupBy('product.category')
      .getRawMany();
  }
}
