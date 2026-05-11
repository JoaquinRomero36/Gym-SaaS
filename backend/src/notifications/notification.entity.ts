import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Gym } from '../gyms/gym.entity';

export enum NotificationChannel {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  IN_APP = 'in-app',
}

export enum NotificationTrigger {
  INACTIVITY = 'inactivity',
  LOW_FEEDBACK = 'low_feedback',
  HIGH_RISK = 'high_risk',
  MILESTONE = 'milestone',
  MANUAL = 'manual',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('notifications')
export class Notification {
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

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.IN_APP,
  })
  channel!: NotificationChannel;

  @Column()
  message!: string;

  @Column({
    type: 'enum',
    enum: NotificationTrigger,
    default: NotificationTrigger.MANUAL,
  })
  trigger!: NotificationTrigger;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status!: NotificationStatus;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
