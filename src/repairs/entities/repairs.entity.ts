import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Claims } from '../../claims/entities/claims.entity';
import { RepairStatus } from '../../common/enums/repair-status.enum';
import { Users } from '../../users/entities/users.entity';
import { RepairParts } from './repair-parts.entity';

@Entity('repairs')
export class Repairs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RepairStatus, default: RepairStatus.ASSIGNED })
  status: RepairStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // set when status becomes COMPLETED
  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;

  // one claim = one repair
  @OneToOne(() => Claims, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn()
  claim: Relation<Claims>;

  @ManyToOne(() => Users, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn()
  technician: Relation<Users>;

  @OneToMany(() => RepairParts, (rp) => rp.repair)
  repairParts: Relation<RepairParts[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
