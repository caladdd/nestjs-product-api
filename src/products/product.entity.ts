import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryColumn()
  id: string;

  @Column()
  sku: string;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  category: string;

  @Column()
  color: string;

  @Column({ type: 'float' })
  price: number;

  @Column()
  currency: string;

  @Column({ type: 'int' })
  stock: number;

  @Column()
  locale: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @Column({ default: false })
  isDeleted: boolean;
}
