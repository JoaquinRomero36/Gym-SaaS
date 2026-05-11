import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { RiskService } from '../risk/risk.service';
import { NotificationsService } from '../notifications/notifications.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class JobsService {
    private churnQueue;
    private messagingQueue;
    private coachAlertQueue;
    private userRepo;
    private riskService;
    private notificationsService;
    private httpService;
    private readonly logger;
    private readonly aiServiceUrl;
    constructor(churnQueue: Queue, messagingQueue: Queue, coachAlertQueue: Queue, userRepo: Repository<User>, riskService: RiskService, notificationsService: NotificationsService, httpService: HttpService, config: ConfigService);
    dailyChurnPrediction(): Promise<void>;
    triggerSinglePrediction(userId: string): Promise<void>;
    triggerMessaging(userId: string, trigger: string): Promise<void>;
    processBatch(): Promise<void>;
    processSingle(userId: string): Promise<void>;
    processMessage(userId: string, trigger: string): Promise<void>;
    processCoachAlert(userId: string, score: number, gymId: string): Promise<void>;
}
