"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const gyms_service_1 = require("./gyms/gyms.service");
const users_service_1 = require("./users/users.service");
const coaches_service_1 = require("./coaches/coaches.service");
const gym_entity_1 = require("./gyms/gym.entity");
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const gymsService = app.get(gyms_service_1.GymsService);
    const usersService = app.get(users_service_1.UsersService);
    const coachesService = app.get(coaches_service_1.CoachesService);
    const gym = await gymsService.create({
        name: 'Gimnasio Demo',
        plan: gym_entity_1.GymPlan.PRO,
    });
    console.log(`✓ Gym created: ${gym.name} (${gym.id})`);
    await usersService.create({
        gym_id: gym.id,
        name: 'Admin',
        email: 'admin@gym.com',
        password: 'admin123',
        role: 'admin',
    });
    console.log('✓ Admin created: admin@gym.com');
    const coach = await coachesService.create({
        gym_id: gym.id,
        name: 'Coach Demo',
        email: 'coach@gym.com',
        password: 'coach123',
    });
    console.log(`✓ Coach created: coach@gym.com (${coach.id})`);
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
//# sourceMappingURL=seed.js.map