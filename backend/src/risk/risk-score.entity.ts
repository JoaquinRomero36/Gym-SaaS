import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Gym } from '../gyms/gym.entity';

export enum RiskCategory {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('risk_scores')
export class RiskScore {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  user_id!: string;

  @ManyToOne(() => Gym, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gym_id' })
  gym!: Gym;

  @Column({ name: 'gym_id' })
  gym_id!: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  score!: number;

  @Column({
    type: 'enum',
    enum: RiskCategory,
    default: RiskCategory.LOW,
  })
  category!: RiskCategory;

  @CreateDateColumn({ name: 'calculated_at' })
  calculatedAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  features?: Record<string, unknown>;
}
