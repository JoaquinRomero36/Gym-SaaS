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
exports.RiskController = void 0;
const common_1 = require("@nestjs/common");
const risk_service_1 = require("./risk.service");
const users_service_1 = require("../users/users.service");
let RiskController = class RiskController {
    constructor(riskService, usersService) {
        this.riskService = riskService;
        this.usersService = usersService;
    }
    async calculate(userId) {
        const user = await this.usersService.findOne(userId);
        return this.riskService.calculateForUser(user);
    }
    async getLatest(userId) {
        return this.riskService.getLatest(userId);
    }
    async getFeatures(userId) {
        return this.riskService.getFeatures(userId);
    }
};
exports.RiskController = RiskController;
__decorate([
    (0, common_1.Post)('calculate/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "calculate", null);
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "getLatest", null);
__decorate([
    (0, common_1.Get)(':userId/features'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "getFeatures", null);
exports.RiskController = RiskController = __decorate([
    (0, common_1.Controller)('risk'),
    __metadata("design:paramtypes", [risk_service_1.RiskService,
        users_service_1.UsersService])
], RiskController);
//# sourceMappingURL=risk.controller.js.map