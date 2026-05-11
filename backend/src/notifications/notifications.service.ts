import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationTrigger } from './notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(data: {
    user_id: string;
    gym_id: string;
    channel: string;
    message: string;
    trigger: string;
  }): Promise<Notification> {
    const notif = this.repo.create({
      user_id: data.user_id,
      gym_id: data.gym_id,
      channel: data.channel as any,
      message: data.message,
      trigger: data.trigger as NotificationTrigger,
    });
    const saved = await this.repo.save(notif);
    this.logger.log(`Notification created: ${saved.id}`);
    return saved;
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.repo.find({
      where: { user_id: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsSent(id: string): Promise<void> {
    await this.repo.update(id, { status: 'sent' as any, sentAt: new Date() });
  }

  async markAsFailed(id: string): Promise<void> {
    await this.repo.update(id, { status: 'failed' as any });
  }
}
