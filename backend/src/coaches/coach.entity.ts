import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Gym } from '../gyms/gym.entity';
import { User } from '../users/user.entity';

@Entity('coaches')
export class Coach {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Gym, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gym_id' })
  gym!: Gym;

  @Column({ name: 'gym_id' })
  gym_id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash?: string;

  @OneToMany(() => User, (u) => u.coach)
  users!: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
