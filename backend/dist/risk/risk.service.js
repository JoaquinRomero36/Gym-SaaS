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
var RiskService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const risk_score_entity_1 = require("./risk-score.entity");
const attendance_service_1 = require("../attendance/attendance.service");
const feedback_service_1 = require("../feedback/feedback.service");
let RiskService = RiskService_1 = class RiskService {
    constructor(repo, attendanceService, feedbackService, config) {
        this.repo = repo;
        this.attendanceService = attendanceService;
        this.feedbackService = feedbackService;
        this.logger = new common_1.Logger(RiskService_1.name);
        this.highThreshold = config.get('CHURN_THRESHOLD_HIGH', 0.7);
        this.mediumThreshold = config.get('CHURN_THRESHOLD_MEDIUM', 0.4);
    }
    async calculateFeatures(user) {
        const lastAttendance = await this.attendanceService.getLastAttendance(user.id);
        const daysSinceLast = lastAttendance
            ? Math.floor((Date.now() - new Date(lastAttendance.date).getTime()) / 86400000)
            : 999;
        const weeklyFrequency = (await this.attendanceService.countInRange(user.id, 28)) / 4;
        const tenureDays = Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / 86400000);
        const consistencyScore = Math.min(weeklyFrequency / 4, 1);
        const avgEffort = await this.feedbackService.averageEffort(user.id, 5);
        const avgEnergy = await this.feedbackService.averageEnergy(user.id, 5);
        const feedbackCount = await this.feedbackService.countInRange(user.id, 14);
        return {
            days_since_last_attendance: daysSinceLast,
            weekly_frequency: Math.round(weeklyFrequency * 100) / 100,
            tenure_days: tenureDays,
            consistency_score: Math.round(consistencyScore * 100) / 100,
            avg_effort_level: Math.round(avgEffort * 100) / 100,
            avg_energy_level: Math.round(avgEnergy * 100) / 100,
            feedback_count_last_2w: feedbackCount,
        };
    }
    computeScore(features) {
        let score = 0;
        if (features.days_since_last_attendance > 14)
            score += 0.4;
        else if (features.days_since_last_attendance > 7)
            score += 0.2;
        if (features.weekly_frequency < 1)
            score += 0.25;
        else if (features.weekly_frequency < 2)
            score += 0.1;
        if (features.consistency_score < 0.3)
            score += 0.15;
        if (features.avg_effort_level < 2.5)
            score += 0.1;
        if (features.feedback_count_last_2w === 0)
            score += 0.1;
        score = Math.min(score, 1);
        let category;
        if (score >= this.highThreshold)
            category = risk_score_entity_1.RiskCategory.HIGH;
        else if (score >= this.mediumThreshold)
            category = risk_score_entity_1.RiskCategory.MEDIUM;
        else
            category = risk_score_entity_1.RiskCategory.LOW;
        return { score, category };
    }
    async calculateForUser(user) {
        const features = await this.calculateFeatures(user);
        const { score, category } = this.computeScore(features);
        const existing = await this.repo.findOne({ where: { user_id: user.id } });
        if (existing) {
            existing.score = score;
            existing.category = category;
            existing.features = features;
            await this.repo.save(existing);
        }
        else {
            await this.repo.save(this.repo.create({
                user_id: user.id,
                gym_id: user.gym_id,
                score,
                category,
                features: features,
            }));
        }
        this.logger.log(`Risk for ${user.id}: score=${score.toFixed(4)} category=${category}`);
        return { score, category, features };
    }
    async getLatest(userId) {
        const scores = await this.repo.find({
            where: { user_id: userId },
            order: { calculatedAt: 'DESC' },
            take: 1,
        });
        return scores[0] ?? null;
    }
    async getFeatures(userId) {
        const latest = await this.getLatest(userId);
        return (latest?.features ?? null);
    }
};
exports.RiskService = RiskService;
exports.RiskService = RiskService = RiskService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(risk_score_entity_1.RiskScore)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        attendance_service_1.AttendanceService,
        feedback_service_1.FeedbackService,
        config_1.ConfigService])
], RiskService);
//# sourceMappingURL=risk.service.js.map