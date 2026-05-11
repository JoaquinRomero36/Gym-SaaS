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
exports.Routine = void 0;
const typeorm_1 = require("typeorm");
const gym_entity_1 = require("../gyms/gym.entity");
const coach_entity_1 = require("../coaches/coach.entity");
const user_entity_1 = require("../users/user.entity");
const exercise_entity_1 = require("../exercises/exercise.entity");
let Routine = class Routine {
};
exports.Routine = Routine;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Routine.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => gym_entity_1.Gym, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'gym_id' }),
    __metadata("design:type", gym_entity_1.Gym)
], Routine.prototype, "gym", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gym_id' }),
    __metadata("design:type", String)
], Routine.prototype, "gym_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => coach_entity_1.Coach, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'coach_id' }),
    __metadata("design:type", coach_entity_1.Coach)
], Routine.prototype, "coach", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'coach_id', nullable: true }),
    __metadata("design:type", Object)
], Routine.prototype, "coach_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Routine.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", Object)
], Routine.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Routine.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Routine.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => exercise_entity_1.Exercise, (e) => e.routine),
    __metadata("design:type", Array)
], Routine.prototype, "exercises", void 0);
exports.Routine = Routine = __decorate([
    (0, typeorm_1.Entity)('routines')
], Routine);
//# sourceMappingURL=routine.entity.js.map