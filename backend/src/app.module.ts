import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { HealthModule } from './health/health.module';
import { GymsModule } from './gyms/gyms.module';
import { UsersModule } from './users/users.module';
import { CoachesModule } from './coaches/coaches.module';
import { RoutinesModule } from './routines/routines.module';
import { ExercisesModule } from './exercises/exercises.module';
import { AttendanceModule } from './attendance/attendance.module';
import { FeedbackModule } from './feedback/feedback.module';
import { RiskModule } from './risk/risk.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { StatsModule } from './stats/stats.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { TenantService } from './common/services/tenant.service';
import { AiClientService } from './common/services/ai-client.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.local'] }),
    HttpModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', '127.0.0.1'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get('DATABASE_USER', 'postgres'),
        password: config.get('DATABASE_PASSWORD', 'Fortnite36'),
        database: config.get('DATABASE_NAME', 'gym'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    HealthModule,
    GymsModule,
    UsersModule,
    CoachesModule,
    RoutinesModule,
    ExercisesModule,
    AttendanceModule,
    FeedbackModule,
    RiskModule,
    NotificationsModule,
    AuthModule,
    StatsModule,
  ],
  providers: [
    TenantService,
    AiClientService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
  ],
  exports: [TenantService, AiClientService],
})
export class AppModule {}
