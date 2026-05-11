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
exports.FeedbackEntry = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const gym_entity_1 = require("../gyms/gym.entity");
let FeedbackEntry = class FeedbackEntry {
};
exports.FeedbackEntry = FeedbackEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FeedbackEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], FeedbackEntry.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], FeedbackEntry.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => gym_entity_1.Gym, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'gym_id' }),
    __metadata("design:type", gym_entity_1.Gym)
], FeedbackEntry.prototype, "gym", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gym_id' }),
    __metadata("design:type", String)
], FeedbackEntry.prototype, "gym_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], FeedbackEntry.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effort_level', type: 'int' }),
    __metadata("design:type", Number)
], FeedbackEntry.prototype, "effortLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'energy_level', type: 'int' }),
    __metadata("design:type", Number)
], FeedbackEntry.prototype, "energyLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FeedbackEntry.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FeedbackEntry.prototype, "createdAt", void 0);
exports.FeedbackEntry = FeedbackEntry = __decorate([
    (0, typeorm_1.Entity)('feedback_entries')
], FeedbackEntry);
//# sourceMappingURL=feedback-entry.entity.js.map