"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const schedule_1 = require("@nestjs/schedule");
const job_names_1 = require("./job-names");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const risk_service_1 = require("../risk/risk.service");
const notifications_service_1 = require("../notifications/notifications.service");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let JobsService = JobsService_1 = class JobsService {
    constructor(churnQueue, messagingQueue, coachAlertQueue, userRepo, riskService, notificationsService, httpService, config) {
        this.churnQueue = churnQueue;
        this.messagingQueue = messagingQueue;
        this.coachAlertQueue = coachAlertQueue;
        this.userRepo = userRepo;
        this.riskService = riskService;
        this.notificationsService = notificationsService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(JobsService_1.name);
        this.aiServiceUrl = config.get('AI_SERVICE_URL', 'http://localhost:8000');
    }
    async dailyChurnPrediction() {
        this.logger.log('🏋️ Starting daily churn prediction job');
        await this.churnQueue.add('batch', {}, { removeOnComplete: { age: 3600 * 24 }, removeOnFail: { age: 3600 * 24 * 7 } });
    }
    async triggerSinglePrediction(userId) {
        await this.churnQueue.add('single', { userId }, { removeOnComplete: { age: 3600 }, removeOnFail: { age: 3600 * 24 } });
    }
    async triggerMessaging(userId, trigger) {
        await this.messagingQueue.add('send', { userId, trigger }, { removeOnComplete: { age: 3600 }, removeOnFail: { age: 3600 * 24 } });
    }
    async processBatch() {
        const activeUsers = await this.userRepo.find({
            where: { status: user_entity_1.UserStatus.ACTIVE },
        });
        this.logger.log(`Processing batch for ${activeUsers.length} users`);
        for (const user of activeUsers) {
            try {
                const result = await this.riskService.calculateForUser(user);
                if (result.category === 'high') {
                    await this.coachAlertQueue.add('alert', { userId: user.id, score: result.score, gymId: user.gym_id }, { removeOnComplete: { age: 3600 * 24 } });
                }
                if (result.category === 'high' || result.category === 'medium') {
                    await this.triggerMessaging(user.id, result.category);
                }
            }
            catch (err) {
                this.logger.error(`Batch error for user ${user.id}:`, err);
            }
        }
    }
    async processSingle(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            this.logger.warn(`User ${userId} not found for single prediction`);
            return;
        }
        await this.riskService.calculateForUser(user);
    }
    async processMessage(userId, trigger) {
        try {
            const features = await this.riskService.getFeatures(userId);
            if (!features) {
                this.logger.warn(`No features for user ${userId}`);
                return;
            }
            const user = await this.userRepo.findOne({ where: { id: userId } });
            if (!user)
                return;
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.aiServiceUrl}/messaging/generate`, {
                days_inactive: features.days_since_last_attendance,
                level: user.level,
                last_effort: features.avg_effort_level,
                last_energy: features.avg_energy_level,
            }));
            await this.notificationsService.create({
                user_id: userId,
                gym_id: user.gym_id,
                channel: 'in-app',
                message: data.message,
                trigger: trigger,
            });
            this.logger.log(`Message sent to user ${userId}`);
        }
        catch (err) {
            this.logger.error(`Messaging failed for user ${userId}:`, err);
        }
    }
    async processCoachAlert(userId, score, gymId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user?.coach_id)
            return;
        await this.notificationsService.create({
            user_id: user.coach_id,
            gym_id: gymId,
            channel: 'in-app',
            message: `⚠️ Alerta: ${user.name} tiene alto riesgo de abandono (score: ${score.toFixed(2)})`,
            trigger: 'high_risk',
        });
    }
};
exports.JobsService = JobsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "dailyChurnPrediction", null);
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(job_names_1.JobNames.CHURN_PREDICTION)),
    __param(1, (0, bullmq_1.InjectQueue)(job_names_1.JobNames.MESSAGING)),
    __param(2, (0, bullmq_1.InjectQueue)(job_names_1.JobNames.COACH_ALERT)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue,
        typeorm_2.Repository,
        risk_service_1.RiskService,
        notifications_service_1.NotificationsService,
        axios_1.HttpService,
        config_1.ConfigService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map