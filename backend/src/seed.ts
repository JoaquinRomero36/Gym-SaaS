import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GymsService } from './gyms/gyms.service';
import { UsersService } from './users/users.service';
import { GymPlan } from './gyms/gym.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const gymsService = app.get(GymsService);
  const usersService = app.get(UsersService);

  // Create a gym
  const gym = await gymsService.create({
    name: 'Gimnasio Demo',
    plan: GymPlan.PRO,
  });
  console.log(`✓ Gym created: ${gym.name} (${gym.id})`);

  // Create an admin user for the gym
  const admin = await usersService.create({
    gym_id: gym.id,
    name: 'Admin',
    email: 'admin@gym.com',
    password: 'admin123',
  });
  console.log(`✓ Admin created: ${admin.email}`);

  // Create a coach
  const coach = await usersService.create({
    gym_id: gym.id,
    name: 'Coach Demo',
    email: 'coach@gym.com',
    password: 'coach123',
    level: 'advanced',
  });
  console.log(`✓ Coach created: ${coach.email}`);

  // Create a member
  const member = await usersService.create({
    gym_id: gym.id,
    coach_id: coach.id,
    name: 'Miembro Demo',
    email: 'member@gym.com',
    password: 'member123',
    level: 'beginner',
  });
  console.log(`✓ Member created: ${member.email}`);

  console.log('\n✅ Seed completed');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
