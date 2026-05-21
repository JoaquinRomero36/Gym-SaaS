import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GymsService } from './gyms/gyms.service';
import { UsersService } from './users/users.service';
import { CoachesService } from './coaches/coaches.service';
import { RoutinesService } from './routines/routines.service';
import { ExercisesService } from './exercises/exercises.service';
import { AttendanceService } from './attendance/attendance.service';
import { FeedbackService } from './feedback/feedback.service';
import { NotificationsService } from './notifications/notifications.service';
import { TenantService } from './common/services/tenant.service';
import { GymPlan } from './gyms/gym.entity';
import { RiskScore, RiskCategory } from './risk/risk-score.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const gymsService = app.get(GymsService);
  const usersService = app.get(UsersService);
  const coachesService = app.get(CoachesService);
  const routinesService = app.get(RoutinesService);
  const exercisesService = app.get(ExercisesService);
  const attendanceService = app.get(AttendanceService);
  const feedbackService = app.get(FeedbackService);
  const notificationsService = app.get(NotificationsService);
  const tenantService = app.get(TenantService);
  const riskRepo: Repository<RiskScore> = app.get(getRepositoryToken(RiskScore));

  const ds = app.get(DataSource);
  await ds.query(`
    TRUNCATE notifications, risk_scores, feedback_entries,
    attendance_logs, exercises, routines, users, coaches, gyms CASCADE
  `);
  console.log('✓ Existing data cleaned');

  const gym = await gymsService.create({ name: 'Gimnasio Fitness Pro', plan: GymPlan.PRO });
  console.log(`✓ Gym: ${gym.name} (${gym.id})`);

  await tenantService.runInTenantContext(gym.id, async () => {
    const admin = await usersService.create({
      gym_id: gym.id, name: 'Admin', email: 'admin@gym.com', password: 'admin123', role: 'admin',
    });
    console.log('✓ Admin: admin@gym.com / admin123');

    const coach = await coachesService.create({
      gym_id: gym.id, name: 'Coach Carlos', email: 'coach@gym.com', password: 'coach123',
    });
    console.log('✓ Coach: coach@gym.com / coach123');

    const member = await usersService.create({
      gym_id: gym.id, coach_id: coach.id, name: 'Miembro Demo',
      email: 'member@gym.com', password: 'member123', level: 'beginner',
    });
    console.log('✓ Member: member@gym.com / member123');

    const juan = await usersService.create({
      gym_id: gym.id, coach_id: coach.id, name: 'Juan Pérez',
      email: 'juan@gym.com', password: 'member123', level: 'beginner',
    });
    const maria = await usersService.create({
      gym_id: gym.id, coach_id: coach.id, name: 'María García',
      email: 'maria@gym.com', password: 'member123', level: 'intermediate',
    });
    const carlos = await usersService.create({
      gym_id: gym.id, name: 'Carlos López',
      email: 'carlos@gym.com', password: 'member123', level: 'advanced',
    });
    const ana = await usersService.create({
      gym_id: gym.id, name: 'Ana Martínez',
      email: 'ana@gym.com', password: 'member123', level: 'intermediate',
    });
    console.log('✓ 4 extra members created');

    const users = [member, juan, maria, carlos, ana];

    const routine = await routinesService.create({
      name: 'Rutina de Fuerza Full Body', coach_id: coach.id, user_id: member.id,
    });
    await exercisesService.createMany([
      { routine_id: routine.id, name: 'Press de Banca', sets: 4, reps: 10, order: 1 },
      { routine_id: routine.id, name: 'Sentadilla', sets: 4, reps: 12, order: 2 },
      { routine_id: routine.id, name: 'Remo con Barra', sets: 3, reps: 10, order: 3 },
      { routine_id: routine.id, name: 'Press Militar', sets: 3, reps: 10, order: 4 },
      { routine_id: routine.id, name: 'Peso Muerto', sets: 3, reps: 8, order: 5 },
    ]);
    console.log(`✓ Routine "${routine.name}" with 5 exercises`);

    const now = new Date();
    for (let daysAgo = 30; daysAgo >= 0; daysAgo -= 2) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      await attendanceService.create(
        { user_id: member.id, date: date.toISOString().split('T')[0], completed: true },
        gym.id,
      );
    }
    for (let daysAgo = 28; daysAgo >= 0; daysAgo -= 3) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      await attendanceService.create(
        { user_id: juan.id, date: date.toISOString().split('T')[0], completed: true },
        gym.id,
      );
    }
    for (let daysAgo = 25; daysAgo >= 0; daysAgo -= 2) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      await attendanceService.create(
        { user_id: maria.id, date: date.toISOString().split('T')[0], completed: true },
        gym.id,
      );
    }
    await attendanceService.create(
      { user_id: carlos.id, date: '2026-04-01', completed: false },
      gym.id,
    );
    console.log('✓ Attendance logs created');

    const effortLevels = [3, 4, 5, 4, 3, 5, 4, 4, 5, 3, 4, 4];
    const energyLevels = [4, 3, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4];
    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i * 2));
      await feedbackService.create({
        user_id: member.id,
        date: date.toISOString().split('T')[0],
        effort_level: effortLevels[i],
        energy_level: energyLevels[i],
        note: i % 3 === 0 ? 'Buena sesión 💪' : undefined,
      }, gym.id);
    }
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (25 - i * 4));
      await feedbackService.create({
        user_id: juan.id,
        date: date.toISOString().split('T')[0],
        effort_level: 4,
        energy_level: 3,
      }, gym.id);
    }
    for (let i = 0; i < 8; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (27 - i * 3));
      await feedbackService.create({
        user_id: maria.id,
        date: date.toISOString().split('T')[0],
        effort_level: 5,
        energy_level: 5,
      }, gym.id);
    }
    console.log('✓ Feedback entries created');

    const scores: { user_id: string; score: number; category: RiskCategory }[] = [
      { user_id: member.id, score: 0.42, category: RiskCategory.MEDIUM },
      { user_id: juan.id, score: 0.18, category: RiskCategory.LOW },
      { user_id: maria.id, score: 0.55, category: RiskCategory.MEDIUM },
      { user_id: carlos.id, score: 0.85, category: RiskCategory.HIGH },
      { user_id: ana.id, score: 0.92, category: RiskCategory.HIGH },
    ];
    for (const s of scores) {
      await riskRepo.insert({
        user_id: s.user_id, gym_id: gym.id,
        score: s.score, category: s.category,
      });
    }
    console.log('✓ Risk scores created');

    await notificationsService.create({
      user_id: member.id, channel: 'in-app',
      message: '🎉 Bienvenido a Gimnasio Fitness Pro. ¡A darle!',
      trigger: 'milestone',
    });
    await notificationsService.create({
      user_id: member.id, channel: 'in-app',
      message: '💪 Completaste 15 sesiones este mes. Sigue así.',
      trigger: 'milestone',
    });
    await notificationsService.create({
      user_id: member.id, channel: 'in-app',
      message: '⚠️ Hace 3 días que no registras feedback. Contanos cómo te sentís.',
      trigger: 'inactivity',
    });
    console.log('✓ Notifications created');
  });

  console.log('\n✅ Seed completado exitosamente');
  console.log('   Admin:  admin@gym.com  / admin123');
  console.log('   Coach:  coach@gym.com  / coach123');
  console.log('   Member: member@gym.com / member123');
  console.log('\n📊 Datos de prueba generados:');
  console.log('   - 1 gym, 1 admin, 1 coach, 5 miembros');
  console.log('   - 1 rutina con 5 ejercicios');
  console.log('   - ~45 asistencias totales');
  console.log('   - ~26 feedbacks totales');
  console.log('   - 5 scores de riesgo (2 low, 2 medium, 2 high)');
  console.log('   - 3 notificaciones para member demo');

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
