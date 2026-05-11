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
var MessagingProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const job_names_1 = require("../job-names");
const jobs_service_1 = require("../jobs.service");
let MessagingProcessor = MessagingProcessor_1 = class MessagingProcessor extends bullmq_1.WorkerHost {
    constructor(jobsService) {
        super();
        this.jobsService = jobsService;
        this.logger = new common_1.Logger(MessagingProcessor_1.name);
    }
    async process(job) {
        const { userId, trigger } = job.data;
        this.logger.log(`Processing messaging for user ${userId} (${trigger})`);
        await this.jobsService.processMessage(userId, trigger);
        this.logger.log(`Messaging done for user ${userId}`);
    }
};
exports.MessagingProcessor = MessagingProcessor;
exports.MessagingProcessor = MessagingProcessor = MessagingProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(job_names_1.JobNames.MESSAGING),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], MessagingProcessor);
//# sourceMappingURL=messaging.processor.js.map