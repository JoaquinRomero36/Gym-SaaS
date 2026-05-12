import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RiskService } from '../src/risk/risk.service';
import { TenantService } from '../src/common/services/tenant.service';
import { AttendanceService } from '../src/attendance/attendance.service';
import { FeedbackService } from '../src/feedback/feedback.service';
import { RiskScore, RiskCategory } from '../src/risk/risk-score.entity';
import { ChurnFeatures, ChurnResult } from '../src/risk/risk.types';
import { User, UserStatus, UserRole, UserLevel } from '../src/users/user.entity';
import { AiClientService } from '../src/common/services/ai-client.service';

const mockGymId = 'gym-test-123';

const createMockUser = (overrides = {}): User => ({
  id: 'user-1',
  gym_id: mockGymId,
  name: 'Test User',
  email: 'test@test.com',
  passwordHash: 'hash',
  role: UserRole.MEMBER,
  level: UserLevel.BEGINNER,
  status: UserStatus.ACTIVE,
  joinedAt: new Date('2024-01-01'),
  gym: {} as any,
  coach: undefined,
  ...overrides,
});

describe('RiskService (unit)', () => {
  let service: RiskService;
  let repo: Repository<RiskScore>;
  let attendanceService: AttendanceService;
  let feedbackService: FeedbackService;
  let tenantService: TenantService;
  let aiClient: AiClientService;

  const mockRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    create: jest.fn().mockImplementation((data) => data),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockTenantService = {
    gymId: mockGymId,
    safeGymId: mockGymId,
    setTenantContext: jest.fn(),
    runInTenantContext: jest.fn().mockImplementation((_gymId: string, fn: Function) => fn()),
  };

  const mockAttendanceService = {
    getLastAttendance: jest.fn(),
    countInRange: jest.fn(),
  };

  const mockFeedbackService = {
    averageEffort: jest.fn(),
    averageEnergy: jest.fn(),
    countInRange: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'CHURN_THRESHOLD_HIGH') return 0.7;
      if (key === 'CHURN_THRESHOLD_MEDIUM') return 0.4;
      return null;
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskService,
        { provide: getRepositoryToken(RiskScore), useValue: mockRepo },
        { provide: TenantService, useValue: mockTenantService },
        { provide: AttendanceService, useValue: mockAttendanceService },
        { provide: FeedbackService, useValue: mockFeedbackService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: AiClientService,
          useValue: { predictChurn: jest.fn(), predictChurnBatch: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RiskService>(RiskService);
    attendanceService = module.get<AttendanceService>(AttendanceService);
    feedbackService = module.get<FeedbackService>(FeedbackService);
    tenantService = module.get<TenantService>(TenantService);
    aiClient = module.get<AiClientService>(AiClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('computeScore', () => {
    it('should return HIGH when days inactive > 14 and low effort', () => {
      const features: ChurnFeatures = {
        days_since_last_attendance: 20,
        weekly_frequency: 0.5,
        tenure_days: 30,
        consistency_score: 0.2,
        avg_effort_level: 1.5,
        avg_energy_level: 1.5,
        feedback_count_last_2w: 0,
      };
      const result = service.computeScore(features);
      expect(result.category).toBe(RiskCategory.HIGH);
      expect(result.score).toBeGreaterThanOrEqual(0.7);
    });

    it('should return LOW for active and consistent user', () => {
      const features: ChurnFeatures = {
        days_since_last_attendance: 1,
        weekly_frequency: 4,
        tenure_days: 365,
        consistency_score: 0.9,
        avg_effort_level: 4,
        avg_energy_level: 4,
        feedback_count_last_2w: 3,
      };
      const result = service.computeScore(features);
      expect(result.category).toBe(RiskCategory.LOW);
      expect(result.score).toBeLessThan(0.4);
    });

    it('should return MEDIUM for borderline case', () => {
      const features: ChurnFeatures = {
        days_since_last_attendance: 10,
        weekly_frequency: 1.5,
        tenure_days: 100,
        consistency_score: 0.5,
        avg_effort_level: 3,
        avg_energy_level: 3,
        feedback_count_last_2w: 1,
      };
      const result = service.computeScore(features);
      expect(result.score).toBeGreaterThanOrEqual(0.4);
      expect(result.score).toBeLessThan(0.7);
    });
  });

  describe('calculateForUser', () => {
    const setupMocks = () => {
      (mockAttendanceService.getLastAttendance as jest.Mock).mockResolvedValue({ date: new Date('2024-01-01') });
      (mockAttendanceService.countInRange as jest.Mock).mockResolvedValue(2);
      (mockFeedbackService.averageEffort as jest.Mock).mockResolvedValue(1);
      (mockFeedbackService.averageEnergy as jest.Mock).mockResolvedValue(1);
      (mockFeedbackService.countInRange as jest.Mock).mockResolvedValue(0);
      (aiClient.predictChurn as jest.Mock).mockResolvedValue(null);
    };

    it('should use AI service result when available', async () => {
      setupMocks();
      const aiResult: ChurnResult = {
        score: 0.85,
        category: RiskCategory.HIGH,
        features: {
          days_since_last_attendance: 20,
          weekly_frequency: 0.5,
          tenure_days: 30,
          consistency_score: 0.2,
          avg_effort_level: 1.5,
          avg_energy_level: 1.5,
          feedback_count_last_2w: 0,
        },
      };
      (aiClient.predictChurn as jest.Mock).mockResolvedValueOnce(aiResult);

      const user = createMockUser();
      const result = await service.calculateForUser(user);

      expect(result.score).toBe(0.85);
      expect(result.category).toBe(RiskCategory.HIGH);
      expect(aiClient.predictChurn).toHaveBeenCalled();
    });

    it('should fallback to local scoring when AI service unavailable', async () => {
      setupMocks();

      const user = createMockUser();
      const result = await service.calculateForUser(user);

      expect(result.score).toBeGreaterThanOrEqual(0.7);
      expect(result.category).toBe(RiskCategory.HIGH);
    });

    it('should use tenant context in batch mode', async () => {
      setupMocks();

      const user = createMockUser();
      await service.calculateForUserBatch(user, mockGymId);

      expect(tenantService.runInTenantContext).toHaveBeenCalledWith(mockGymId, expect.any(Function));
    });
  });
});