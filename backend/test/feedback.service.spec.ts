import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackService } from '../src/feedback/feedback.service';
import { TenantService } from '../src/common/services/tenant.service';
import { FeedbackEntry } from '../src/feedback/feedback-entry.entity';

describe('FeedbackService (unit)', () => {
  let service: FeedbackService;

  const mockGymId = 'gym-test-123';

  const mockRepo: Record<string, jest.Mock> = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockTenantService = {
    gymId: mockGymId,
    safeGymId: mockGymId,
    setTenantContext: jest.fn(),
    runInTenantContext: jest.fn().mockImplementation((_gymId: string, fn: Function) => fn()),
  };

  const createMockFeedback = (overrides = {}): FeedbackEntry => ({
    id: 'f1',
    user_id: '',
    gym_id: mockGymId,
    date: new Date(),
    effortLevel: 3,
    energyLevel: 3,
    note: undefined,
    createdAt: new Date(),
    ...overrides,
  } as FeedbackEntry);

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: getRepositoryToken(FeedbackEntry), useValue: mockRepo },
        { provide: TenantService, useValue: mockTenantService },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should use tenant gymId', async () => {
      const saved = createMockFeedback({ user_id: 'user-1', effortLevel: 4, energyLevel: 3 });
      (mockRepo.save as jest.Mock).mockResolvedValue(saved);

      const dto = { user_id: 'user-1', date: '2025-01-01', effort_level: 4, energy_level: 3 };
      const result = await service.create(dto);
      expect(result.gym_id).toBe(mockGymId);
      expect(result.effortLevel).toBe(4);
      expect(result.energyLevel).toBe(3);
    });
  });

  describe('findByUser', () => {
    it('should filter by user and gymId', async () => {
      (mockRepo.find as jest.Mock).mockResolvedValue([]);
      await service.findByUser('user-1');
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { user_id: 'user-1', gym_id: mockGymId },
        order: { date: 'DESC' },
      });
    });
  });

  describe('getLastN', () => {
    it('should return last N entries filtered by tenant', async () => {
      (mockRepo.find as jest.Mock).mockResolvedValue([]);
      await service.getLastN('user-1', 3);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { user_id: 'user-1', gym_id: mockGymId },
        order: { date: 'DESC' },
        take: 3,
      });
    });
  });

  describe('averageEffort', () => {
    it('should calculate average correctly', async () => {
      (mockRepo.find as jest.Mock).mockResolvedValue([
        createMockFeedback({ effortLevel: 4 }),
        createMockFeedback({ effortLevel: 3 }),
        createMockFeedback({ effortLevel: 5 }),
      ]);
      const avg = await service.averageEffort('user-1', 3);
      expect(avg).toBe(4);
    });

    it('should return 0 when no entries', async () => {
      (mockRepo.find as jest.Mock).mockResolvedValue([]);
      const avg = await service.averageEffort('user-1', 3);
      expect(avg).toBe(0);
    });
  });

  describe('averageEnergy', () => {
    it('should calculate average correctly', async () => {
      (mockRepo.find as jest.Mock).mockResolvedValue([
        createMockFeedback({ energyLevel: 4 }),
        createMockFeedback({ energyLevel: 2 }),
      ]);
      const avg = await service.averageEnergy('user-1', 2);
      expect(avg).toBe(3);
    });

    it('should return 0 when no entries', async () => {
      (mockRepo.find as jest.Mock).mockResolvedValue([]);
      const avg = await service.averageEnergy('user-1', 5);
      expect(avg).toBe(0);
    });
  });

  describe('countInRange', () => {
    it('should filter by user, gymId and date range', async () => {
      (mockRepo.count as jest.Mock).mockResolvedValue(3);
      const count = await service.countInRange('user-1', 14);
      expect(count).toBe(3);
      const callWhere = (mockRepo.count as jest.Mock).mock.calls[0][0].where;
      expect(callWhere.user_id).toBe('user-1');
      expect(callWhere.gym_id).toBe(mockGymId);
    });
  });
});