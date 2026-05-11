"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const health_module_1 = require("./health/health.module");
const gyms_module_1 = require("./gyms/gyms.module");
const users_module_1 = require("./users/users.module");
const coaches_module_1 = require("./coaches/coaches.module");
const routines_module_1 = require("./routines/routines.module");
const exercises_module_1 = require("./exercises/exercises.module");
const attendance_module_1 = require("./attendance/attendance.module");
const feedback_module_1 = require("./feedback/feedback.module");
const risk_module_1 = require("./risk/risk.module");
const notifications_module_1 = require("./notifications/notifications.module");
const jobs_module_1 = require("./jobs/jobs.module");
const auth_module_1 = require("./auth/auth.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const tenant_guard_1 = require("./common/guards/tenant.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.local'] }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DATABASE_HOST', 'localhost'),
                    port: config.get('DATABASE_PORT', 5432),
                    username: config.get('DATABASE_USER', 'postgres'),
                    password: config.get('DATABASE_PASSWORD', 'secret'),
                    database: config.get('DATABASE_NAME', 'gym'),
                    autoLoadEntities: true,
                    synchronize: config.get('NODE_ENV') !== 'production',
                    logging: config.get('NODE_ENV') === 'development',
                }),
            }),
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    connection: {
                        host: config.get('REDIS_HOST', 'localhost'),
                        port: config.get('REDIS_PORT', 6379),
                    },
                }),
            }),
            health_module_1.HealthModule,
            gyms_module_1.GymsModule,
            users_module_1.UsersModule,
            coaches_module_1.CoachesModule,
            routines_module_1.RoutinesModule,
            exercises_module_1.ExercisesModule,
            attendance_module_1.AttendanceModule,
            feedback_module_1.FeedbackModule,
            risk_module_1.RiskModule,
            notifications_module_1.NotificationsModule,
            jobs_module_1.JobsModule,
            auth_module_1.AuthModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_GUARD, useClass: tenant_guard_1.TenantGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map