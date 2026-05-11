import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Coach } from '../coaches/coach.entity';

export enum GymPlan {
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('gyms')
export class Gym {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: GymPlan,
    default: GymPlan.BASIC,
  })
  plan!: GymPlan;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => User, (u) => u.gym)
  users!: User[];

  @OneToMany(() => Coach, (c) => c.gym)
  coaches!: Coach[];
}
