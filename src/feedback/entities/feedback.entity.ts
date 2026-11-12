import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Repairs } from '../../repairs/entities/repairs.entity';
import { Users } from '../../users/entities/users.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 1 to 5
  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  // one feedback per repair
  @OneToOne(() => Repairs, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn()
  repair: Relation<Repairs>;

  @ManyToOne(() => Users, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn()
  customer: Relation<Users>;

  @CreateDateColumn()
  createdAt: Date;
}