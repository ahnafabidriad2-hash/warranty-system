import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Products } from '../../products/entities/products.entity';
import { Users } from '../../users/entities/users.entity';

@Entity('warranties')
@Unique(['product', 'serialNumber'])
export class Warranties {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  serialNumber: string;

  @Column({ type: 'date' })
  purchaseDate: string;

  @Column({ type: 'date' })
  expiryDate: string;

  @ManyToOne(() => Products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  product: Relation<Products>;

  @ManyToOne(() => Users, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  customer: Relation<Users>;

  @ManyToOne(() => Users, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  seller: Relation<Users>;

  @CreateDateColumn()
  createdAt: Date;
}