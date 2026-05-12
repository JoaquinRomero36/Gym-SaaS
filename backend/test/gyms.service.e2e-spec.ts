import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymsService } from '../src/gyms/gyms.service';
import { Gym, GymPlan } from '../src/gyms/gym.entity';
import { TenantService } from '../src/common/services/tenant.service';

describe('GymsService (unit)', () => {
  let service: GymsService;
  let repo: Repository<Gym>;

  const mockGymId = 'abc-123';
  const mockTenantService = {
    gymId: mockGymId,
    safeGymId: mockGymId,
    setTenantContext: jest.fn(),
    runInTenantContext: jest.fn().mockImplementation((_gymId: string, fn: Function) => fn()),
  };

  const mockGym = { id: 'abc-123', name: 'Test Gym', plan: GymPlan.PRO, createdAt: new Date() } as Gym;

  const mockRepo = {
    find: jest.fn().mockResolvedValue([mockGym]),
    findOne: jest.fn().mockResolvedValue(mockGym),
    create: jest.fn().mockReturnValue(mockGym),
    save: jest.fn().mockResolvedValue(mockGym),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GymsService,
        { provide: getRepositoryToken(Gym), useValue: mockRepo },
        { provide: TenantService, useValue: mockTenantService },
      ],
    }).compile();

    service = module.get<GymsService>(GymsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find all gyms filtered by tenant', async () => {
    const gyms = await service.findAll();
    expect(gyms).toHaveLength(1);
    expect(gyms[0].name).toBe('Test Gym');
    expect(mockRepo.find).toHaveBeenCalledWith({ where: { id: mockGymId } });
  });

  it('should find one gym and validate tenant ownership', async () => {
    const gym = await service.findOne('abc-123');
    expect(gym.id).toBe('abc-123');
  });

  it('should throw NotFoundException when gym does not belong to tenant', async () => {
    (mockRepo.findOne as jest.Mock).mockResolvedValueOnce(mockGym);
    const mockService = new GymsService(mockRepo as any, mockTenantService as any);
    (mockService as any).tenantService = {
      ...mockTenantService,
      gymId: 'different-gym',
    };

    await expect(mockService.findOne('other-id')).rejects.toThrow();
  });

  it('should create a gym', async () => {
    const gym = await service.create({ name: 'New Gym', plan: GymPlan.PRO });
    expect(gym).toBeDefined();
    expect(mockRepo.create).toHaveBeenCalledWith({ name: 'New Gym', plan: GymPlan.PRO });
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should update a gym', async () => {
    const gym = await service.update('abc-123', { name: 'Updated Gym' });
    expect(gym).toBeDefined();
    expect(gym.name).toBe('Test Gym');
  });

  it('should delete a gym', async () => {
    await service.remove('abc-123');
    expect(mockRepo.delete).toHaveBeenCalledWith('abc-123');
  });
});
