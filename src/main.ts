import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Product API')
    .setDescription('Contentful Product Sync API')
    .setVersion('1.0')
    .addBearerAuth() // Enable JWT Bearer token
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document); // Serve at /api/docs

  // 👇 Add this endpoint to export JSON if needed (optional)
  writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

  console.log(process.env.PORT || '30023');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
