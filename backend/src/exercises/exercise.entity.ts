import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Routine } from '../routines/routine.entity';
import { Gym } from '../gyms/gym.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Gym, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gym_id' })
  gym!: Gym;

  @Column({ name: 'gym_id' })
  @Index()
  gym_id!: string;

  @ManyToOne(() => Routine, (r) => r.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routine_id' })
  routine!: Routine;

  @Column({ name: 'routine_id' })
  routine_id!: string;

  @Column()
  name!: string;

  @Column({ type: 'int' })
  sets!: number;

  @Column({ type: 'int' })
  reps!: number;

  @Column({ type: 'int' })
  order!: number;
}
