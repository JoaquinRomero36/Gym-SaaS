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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_service_1 = require("../common/services/tenant.service");
const gym_entity_1 = require("./gym.entity");
let GymsService = class GymsService {
    constructor(repo, tenantService) {
        this.repo = repo;
        this.tenantService = tenantService;
    }
    async findAll() {
        return this.repo.find({ where: { id: this.tenantService.gymId } });
    }
    async findAllPublic() {
        return this.repo.find({ select: ['id', 'name'] });
    }
    async findOne(id) {
        const g = await this.repo.findOne({ where: { id } });
        if (!g)
            throw new common_1.NotFoundException(`Gym ${id} not found`);
        if (g.id !== this.tenantService.gymId) {
            throw new common_1.NotFoundException(`Gym ${id} not found in this tenant`);
        }
        return g;
    }
    async create(data) {
        return this.repo.save(this.repo.create(data));
    }
    async update(id, data) {
        await this.repo.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        const gym = await this.findOne(id);
        if (gym.id !== this.tenantService.gymId) {
            throw new common_1.NotFoundException(`Gym ${id} not found`);
        }
        await this.repo.softDelete(id);
    }
};
exports.GymsService = GymsService;
exports.GymsService = GymsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gym_entity_1.Gym)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_service_1.TenantService])
], GymsService);
//# sourceMappingURL=gyms.service.js.map