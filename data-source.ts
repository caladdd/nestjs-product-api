import { DataSource } from 'typeorm';
import { Product } from './src/products/product.entity';
import { User } from './src/auth/user.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Product, User],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
