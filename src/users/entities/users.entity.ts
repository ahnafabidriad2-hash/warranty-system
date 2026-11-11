import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum.js';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar',
     length: 100 })
  name: string;

  @Column({ type: 'varchar',
      length: 150,
      unique: true })
  email: string;

  @Column({ type: 'varchar',
    length: 100,
    select: false })
  password: string;

  @Column({ type: 'enum',
     enum: Role,
     default: Role.CUSTOMER })
  role: Role;

  @Column({ type: 'boolean',
     default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}