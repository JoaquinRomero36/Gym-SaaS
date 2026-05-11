import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Gym } from '../gyms/gym.entity';
import { Coach } from '../coaches/coach.entity';

export enum UserRole {
  ADMIN = 'admin',
  COACH = 'coach',
  MEMBER = 'member',
}

export enum UserLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CHURNED = 'churned',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Gym, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gym_id' })
  gym!: Gym;

  @Column({ name: 'gym_id' })
  gym_id!: string;

  @ManyToOne(() => Coach, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'coach_id' })
  coach?: Coach;

  @Column({ name: 'coach_id', nullable: true })
  coach_id?: string | null;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: UserLevel,
    default: UserLevel.BEGINNER,
  })
  level!: UserLevel;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt!: Date;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;
}
