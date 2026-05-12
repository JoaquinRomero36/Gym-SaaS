import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Gym } from '../gyms/gym.entity';

@Entity('feedback_entries')
export class FeedbackEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  @Index()
  user_id!: string;

  @ManyToOne(() => Gym, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gym_id' })
  gym!: Gym;

  @Column({ name: 'gym_id' })
  @Index()
  gym_id!: string;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ name: 'effort_level', type: 'int' })
  effortLevel!: number;

  @Column({ name: 'energy_level', type: 'int' })
  energyLevel!: number;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
