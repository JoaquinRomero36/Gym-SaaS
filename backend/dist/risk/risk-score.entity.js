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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskScore = exports.RiskCategory = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const gym_entity_1 = require("../gyms/gym.entity");
var RiskCategory;
(function (RiskCategory) {
    RiskCategory["LOW"] = "low";
    RiskCategory["MEDIUM"] = "medium";
    RiskCategory["HIGH"] = "high";
})(RiskCategory || (exports.RiskCategory = RiskCategory = {}));
let RiskScore = class RiskScore {
};
exports.RiskScore = RiskScore;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RiskScore.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], RiskScore.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], RiskScore.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => gym_entity_1.Gym, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'gym_id' }),
    __metadata("design:type", gym_entity_1.Gym)
], RiskScore.prototype, "gym", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gym_id' }),
    __metadata("design:type", String)
], RiskScore.prototype, "gym_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 4 }),
    __metadata("design:type", Number)
], RiskScore.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RiskCategory,
        default: RiskCategory.LOW,
    }),
    __metadata("design:type", String)
], RiskScore.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'calculated_at' }),
    __metadata("design:type", Date)
], RiskScore.prototype, "calculatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RiskScore.prototype, "features", void 0);
exports.RiskScore = RiskScore = __decorate([
    (0, typeorm_1.Entity)('risk_scores')
], RiskScore);
//# sourceMappingURL=risk-score.entity.js.map