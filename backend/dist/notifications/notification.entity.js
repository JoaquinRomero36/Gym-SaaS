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
exports.Notification = exports.NotificationStatus = exports.NotificationTrigger = exports.NotificationChannel = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const gym_entity_1 = require("../gyms/gym.entity");
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["WHATSAPP"] = "whatsapp";
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["IN_APP"] = "in-app";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var NotificationTrigger;
(function (NotificationTrigger) {
    NotificationTrigger["INACTIVITY"] = "inactivity";
    NotificationTrigger["LOW_FEEDBACK"] = "low_feedback";
    NotificationTrigger["HIGH_RISK"] = "high_risk";
    NotificationTrigger["MILESTONE"] = "milestone";
    NotificationTrigger["MANUAL"] = "manual";
})(NotificationTrigger || (exports.NotificationTrigger = NotificationTrigger = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["FAILED"] = "failed";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Notification.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Notification.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => gym_entity_1.Gym, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'gym_id' }),
    __metadata("design:type", gym_entity_1.Gym)
], Notification.prototype, "gym", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gym_id' }),
    __metadata("design:type", String)
], Notification.prototype, "gym_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationChannel,
        default: NotificationChannel.IN_APP,
    }),
    __metadata("design:type", String)
], Notification.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationTrigger,
        default: NotificationTrigger.MANUAL,
    }),
    __metadata("design:type", String)
], Notification.prototype, "trigger", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.PENDING,
    }),
    __metadata("design:type", String)
], Notification.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('notifications')
], Notification);
//# sourceMappingURL=notification.entity.js.map