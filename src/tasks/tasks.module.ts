import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ContentfulService } from '../contentful/contentful.service';
import { ProductModule } from '../products/product.module';

@Module({
  imports: [ProductModule],
  providers: [TasksService, ContentfulService],
})
export class TasksModule {}
