"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const gyms_service_1 = require("./gyms/gyms.service");
const users_service_1 = require("./users/users.service");
const gym_entity_1 = require("./gyms/gym.entity");
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const gymsService = app.get(gyms_service_1.GymsService);
    const usersService = app.get(users_service_1.UsersService);
    const gym = await gymsService.create({
        name: 'Gimnasio Demo',
        plan: gym_entity_1.GymPlan.PRO,
    });
    console.log(`✓ Gym created: ${gym.name} (${gym.id})`);
    const admin = await usersService.create({
        gym_id: gym.id,
        name: 'Admin',
        email: 'admin@gym.com',
        password: 'admin123',
    });
    console.log(`✓ Admin created: ${admin.email}`);
    const coach = await usersService.create({
        gym_id: gym.id,
        name: 'Coach Demo',
        email: 'coach@gym.com',
        password: 'coach123',
        level: 'advanced',
    });
    console.log(`✓ Coach created: ${coach.email}`);
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
//# sourceMappingURL=seed.js.map