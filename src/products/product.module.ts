import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ContentfulService } from '../contentful/contentful.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductService, ContentfulService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
