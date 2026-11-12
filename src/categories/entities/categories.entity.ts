import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Products } from '../../products/entities/products.entity';

@Entity('categories')
export class Categories {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => Products, (product) => product.category)
  products: Relation<Products[]>;

  @CreateDateColumn()
  createdAt: Date;
}
