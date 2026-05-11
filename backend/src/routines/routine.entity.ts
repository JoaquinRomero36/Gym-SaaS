import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Gym } from '../gyms/gym.entity';
import { Coach } from '../coaches/coach.entity';
import { User } from '../users/user.entity';
import { Exercise } from '../exercises/exercise.entity';

@Entity('routines')
export class Routine {
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

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'user_id', nullable: true })
  user_id?: string | null;

  @Column()
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Exercise, (e) => e.routine)
  exercises!: Exercise[];
}
