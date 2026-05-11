"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const user_entity_1 = require("../users/user.entity");
const risk_module_1 = require("../risk/risk.module");
const notifications_module_1 = require("../notifications/notifications.module");
const job_names_1 = require("./job-names");
const jobs_service_1 = require("./jobs.service");
const jobs_controller_1 = require("./jobs.controller");
const churn_prediction_processor_1 = require("./processors/churn-prediction.processor");
const messaging_processor_1 = require("./processors/messaging.processor");
const coach_alert_processor_1 = require("./processors/coach-alert.processor");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            bullmq_1.BullModule.registerQueue({ name: job_names_1.JobNames.CHURN_PREDICTION }, { name: job_names_1.JobNames.CHURN_SINGLE }, { name: job_names_1.JobNames.MESSAGING }, { name: job_names_1.JobNames.COACH_ALERT }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            axios_1.HttpModule,
            risk_module_1.RiskModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [jobs_controller_1.JobsController],
        providers: [
            jobs_service_1.JobsService,
            churn_prediction_processor_1.ChurnPredictionProcessor,
            messaging_processor_1.MessagingProcessor,
            coach_alert_processor_1.CoachAlertProcessor,
        ],
        exports: [jobs_service_1.JobsService],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map