import { Repository } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { Notification } from './notification.entity';
export declare class NotificationsService {
    private readonly repo;
    private readonly tenantService;
    private readonly logger;
    constructor(repo: Repository<Notification>, tenantService: TenantService);
    create(data: {
        user_id: string;
        channel: string;
        message: string;
        trigger: string;
    }): Promise<Notification>;
    findByUser(userId: string): Promise<Notification[]>;
    markAsSent(id: string): Promise<void>;
    markAsFailed(id: string): Promise<void>;
}
