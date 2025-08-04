import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContentfulService } from '../contentful/contentful.service';
import { ProductService } from '../products/product.service';
import { ContentfulProduct } from '../contentful/dto/contenful.dto';

@Injectable()
export class TasksService implements OnModuleInit {
  private initialSyncDone = false;
  constructor(
    private readonly contentful: ContentfulService,
    private readonly productService: ProductService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    console.log('[SYNC] Starting scheduled Contentful sync...');
    const products: ContentfulProduct[] = await this.contentful.fetchProducts();
    for (const p of products) {
      const deletedProduct = await this.productService.findOne({
        id: String(p.id),
        isDeleted: true,
      });

      if (deletedProduct !== null && deletedProduct !== undefined) {
        console.log(`Skipping locally deleted product ${String(p.id)}`);
        continue;
      }
      await this.productService.createProduct(p);
    }
    console.log(
      `[SYNC] Synced ${products.length} products at ${new Date().toISOString()}`,
    );
  }

  async onModuleInit() {
    if (!this.initialSyncDone) {
      this.initialSyncDone = true;
      console.log('[INIT] Triggering initial Contentful sync...');
      await this.handleCron();
    }
  }
}
