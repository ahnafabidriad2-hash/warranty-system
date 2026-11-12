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
import { ClaimStatus } from '../../common/enums/claim-status.enum';
import { Warranties } from '../../warranties/entities/warranties.entity';

@Entity('claims')
export class Claims {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  issueDescription: string;

  @Column({ type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.PENDING })
    status: ClaimStatus;

  @Column({ type: 'text',
    nullable: true })
  rejectionReason: string | null;

  @ManyToOne(() => Warranties, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  warranty: Relation<Warranties>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}