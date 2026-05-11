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
exports.User = exports.UserStatus = exports.UserLevel = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const gym_entity_1 = require("../gyms/gym.entity");
const coach_entity_1 = require("../coaches/coach.entity");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["COACH"] = "coach";
    UserRole["MEMBER"] = "member";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserLevel;
(function (UserLevel) {
    UserLevel["BEGINNER"] = "beginner";
    UserLevel["INTERMEDIATE"] = "intermediate";
    UserLevel["ADVANCED"] = "advanced";
})(UserLevel || (exports.UserLevel = UserLevel = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["CHURNED"] = "churned";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => gym_entity_1.Gym, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'gym_id' }),
    __metadata("design:type", gym_entity_1.Gym)
], User.prototype, "gym", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gym_id' }),
    __metadata("design:type", String)
], User.prototype, "gym_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => coach_entity_1.Coach, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'coach_id' }),
    __metadata("design:type", coach_entity_1.Coach)
], User.prototype, "coach", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'coach_id', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "coach_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash' }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        default: UserRole.MEMBER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserLevel,
        default: UserLevel.BEGINNER,
    }),
    __metadata("design:type", String)
], User.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'joined_at' }),
    __metadata("design:type", Date)
], User.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map