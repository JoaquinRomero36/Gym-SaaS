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
var AttendanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_log_entity_1 = require("./attendance-log.entity");
let AttendanceService = AttendanceService_1 = class AttendanceService {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(AttendanceService_1.name);
    }
    async create(dto) {
        const log = this.repo.create({
            user_id: dto.user_id,
            gym_id: dto.gym_id,
            date: new Date(dto.date),
            completed: dto.completed ?? false,
        });
        return this.repo.save(log);
    }
    async findByUser(userId) {
        return this.repo.find({ where: { user_id: userId }, order: { date: 'DESC' } });
    }
    async findInRange(userId, startDate, endDate) {
        return this.repo.find({
            where: { user_id: userId, date: (0, typeorm_2.Between)(startDate, endDate) },
            order: { date: 'DESC' },
        });
    }
    async getLastAttendance(userId) {
        const logs = await this.repo.find({
            where: { user_id: userId },
            order: { date: 'DESC' },
            take: 1,
        });
        return logs[0] ?? null;
    }
    async countInRange(userId, days) {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        return this.repo.count({
            where: { user_id: userId, date: (0, typeorm_2.Between)(start, end), completed: true },
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = AttendanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_log_entity_1.AttendanceLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map