import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoachesService } from '../src/coaches/coaches.service';
import { TenantService } from '../src/common/services/tenant.service';
import { Coach } from '../src/coaches/coach.entity';

describe('CoachesService (unit)', () => {
  let service: CoachesService;

  const mockGymId = 'gym-test-123';

  // Use jest.fn() for each method that needs call-count tracking
  const mockFindOne = jest.fn();
  const mockFind = jest.fn();
  const mockSave = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  const mockRepo = {
    find: mockFind,
    findOne: mockFindOne,
    save: mockSave,
    create: jest.fn().mockImplementation((data) => data),
    update: mockUpdate,
    delete: mockDelete,
  };

  const mockTenantService = {
    gymId: mockGymId,
    safeGymId: mockGymId,
    setTenantContext: jest.fn(),
    runInTenantContext: jest.fn().mockImplementation((_gymId: string, fn: Function) => fn()),
  };

  const createMockCoach = (overrides = {}): Coach => ({
    id: 'c1',
    gym_id: mockGymId,
    name: 'Coach',
    email: 'c@e.com',
    passwordHash: undefined,
    users: [],
    createdAt: new Date(),
    ...overrides,
  } as Coach);

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoachesService,
        { provide: getRepositoryToken(Coach), useValue: mockRepo },
        { provide: TenantService, useValue: mockTenantService },
      ],
    }).compile();

    service = module.get<CoachesService>(CoachesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all coaches filtered by tenant', async () => {
      const mockCoach = createMockCoach();
      (mockRepo.find as jest.Mock).mockResolvedValue([mockCoach]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect((mockRepo.find as jest.Mock).mock.calls[0][0].where.gym_id).toBe(mockGymId);
    });
  });

  describe('findOne', () => {
    it('should find coach filtered by tenant', async () => {
      const mockCoach = createMockCoach();
      (mockRepo.findOne as jest.Mock).mockResolvedValue(mockCoach);

      const result = await service.findOne('c1');
      expect(result).toBe(mockCoach);
      expect((mockRepo.findOne as jest.Mock).mock.calls[0][0].where).toEqual({
        id: 'c1',
        gym_id: mockGymId,
      });
    });

    it('should throw NotFoundException if coach not in tenant', async () => {
      (mockRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create coach with tenant gymId and hashed password', async () => {
      const savedCoach = createMockCoach({ passwordHash: 'hashed_value' });
      (mockRepo.save as jest.Mock).mockResolvedValue(savedCoach);

      const result = await service.create({
        name: 'Coach',
        email: 'c@e.com',
        gym_id: mockGymId,
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result.gym_id).toBe(mockGymId);
      expect(result.passwordHash).toBeDefined();
      expect(result.passwordHash).not.toBe('password123');
    });

    it('should create coach without password (nullable)', async () => {
      const savedCoach = createMockCoach();
      (mockRepo.save as jest.Mock).mockResolvedValue(savedCoach);

      const result = await service.create({
        name: 'Coach No Pass',
        email: 'nopass@e.com',
        gym_id: mockGymId,
      });

      expect(result).toBeDefined();
      expect(result.passwordHash).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update coach', async () => {
      const originalCoach = createMockCoach();
      const updatedCoach = createMockCoach({ name: 'Updated' });

      // update() calls: 1) repo.update()  2) this.findOne(id) which calls repo.findOne()
      (mockUpdate as jest.Mock).mockResolvedValue({ affected: 1 });
      (mockFindOne as jest.Mock).mockResolvedValue(updatedCoach);

      const result = await service.update('c1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
      expect(mockUpdate).toHaveBeenCalledWith('c1', { name: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should delete coach', async () => {
      await service.remove('c1');
      expect(mockRepo.delete).toHaveBeenCalledWith('c1');
    });
  });
});