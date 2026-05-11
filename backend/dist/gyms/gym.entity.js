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
exports.Gym = exports.GymPlan = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const coach_entity_1 = require("../coaches/coach.entity");
var GymPlan;
(function (GymPlan) {
    GymPlan["BASIC"] = "basic";
    GymPlan["PRO"] = "pro";
    GymPlan["ENTERPRISE"] = "enterprise";
})(GymPlan || (exports.GymPlan = GymPlan = {}));
let Gym = class Gym {
};
exports.Gym = Gym;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Gym.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Gym.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GymPlan,
        default: GymPlan.BASIC,
    }),
    __metadata("design:type", String)
], Gym.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Gym.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (u) => u.gym),
    __metadata("design:type", Array)
], Gym.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => coach_entity_1.Coach, (c) => c.gym),
    __metadata("design:type", Array)
], Gym.prototype, "coaches", void 0);
exports.Gym = Gym = __decorate([
    (0, typeorm_1.Entity)('gyms')
], Gym);
//# sourceMappingURL=gym.entity.js.map