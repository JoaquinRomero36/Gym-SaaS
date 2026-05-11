import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GymsService } from './gyms/gyms.service';
import { UsersService } from './users/users.service';
import { CoachesService } from './coaches/coaches.service';
import { GymPlan } from './gyms/gym.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const gymsService = app.get(GymsService);
  const usersService = app.get(UsersService);
  const coachesService = app.get(CoachesService);

  // Create a gym
  const gym = await gymsService.create({
    name: 'Gimnasio Demo',
    plan: GymPlan.PRO,
  });
  console.log(`✓ Gym created: ${gym.name} (${gym.id})`);

  // Create an admin user for the gym
  await usersService.create({
    gym_id: gym.id,
    name: 'Admin',
    email: 'admin@gym.com',
    password: 'admin123',
    role: 'admin',
  });
  console.log('✓ Admin created: admin@gym.com');

  // Create a coach in the coaches table
  const coach = await coachesService.create({
    gym_id: gym.id,
    name: 'Coach Demo',
    email: 'coach@gym.com',
    password: 'coach123',
  });
  console.log(`✓ Coach created: coach@gym.com (${coach.id})`);

  // Create a member referencing the coach
  await usersService.create({
    gym_id: gym.id,
    coach_id: coach.id,
    name: 'Miembro Demo',
    email: 'member@gym.com',
    password: 'member123',
    level: 'beginner',
  });
  console.log('✓ Member created: member@gym.com');

  console.log('\n✅ Seed completed');
  console.log('   Admin:  admin@gym.com / admin123');
  console.log('   Coach:  coach@gym.com / coach123');
  console.log('   Member: member@gym.com / member123');

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
