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
var FeedbackService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const feedback_entry_entity_1 = require("./feedback-entry.entity");
let FeedbackService = FeedbackService_1 = class FeedbackService {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(FeedbackService_1.name);
    }
    async create(dto) {
        const entry = this.repo.create({
            user_id: dto.user_id,
            gym_id: dto.gym_id,
            date: new Date(dto.date),
            effortLevel: dto.effort_level,
            energyLevel: dto.energy_level,
            note: dto.note,
        });
        return this.repo.save(entry);
    }
    async findByUser(userId) {
        return this.repo.find({ where: { user_id: userId }, order: { date: 'DESC' } });
    }
    async getLastN(userId, n) {
        return this.repo.find({
            where: { user_id: userId },
            order: { date: 'DESC' },
            take: n,
        });
    }
    async countInRange(userId, days) {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        return this.repo.count({
            where: { user_id: userId, date: (0, typeorm_2.Between)(start, end) },
        });
    }
    async averageEffort(userId, lastN) {
        const entries = await this.getLastN(userId, lastN);
        if (!entries.length)
            return 0;
        return entries.reduce((a, e) => a + e.effortLevel, 0) / entries.length;
    }
    async averageEnergy(userId, lastN) {
        const entries = await this.getLastN(userId, lastN);
        if (!entries.length)
            return 0;
        return entries.reduce((a, e) => a + e.energyLevel, 0) / entries.length;
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = FeedbackService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feedback_entry_entity_1.FeedbackEntry)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map