import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Categories } from '../../categories/entities/categories.entity.js';
import { Users } from '../../users/entities/users.entity.js';

@Entity('products')
export class Products {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar',
    length: 150 })
  name: string;

  @Column({ type: 'varchar',
    length: 100,
    nullable: true })
  brand: string | null;

  @Column({ type: 'int' })
  warrantyMonths: number;

  @Column({ type: 'boolean',
    default: true })
  isActive: boolean;

  @ManyToOne(() => Categories, (category) => category.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  category: Relation<Categories>;

  @ManyToOne(() => Users, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  seller: Relation<Users>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}