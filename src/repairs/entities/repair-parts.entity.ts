import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Parts } from '../../parts/entities/parts.entity';
import { Repairs } from './repairs.entity';

@Entity('repair_parts')
@Unique(['repair', 'part'])
export class RepairParts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // how many of this part were used
  @Column({ type: 'int' })
  quantity: number;

  // deleting a repair deletes its part usage
  @ManyToOne(() => Repairs, (repair) => repair.repairParts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  repair: Relation<Repairs>;

  // a part can't be deleted if a repair used it
  @ManyToOne(() => Parts, { nullable: false, onDelete: 'RESTRICT' })
  part: Relation<Parts>;
}