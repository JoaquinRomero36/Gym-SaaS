import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../src/notifications/notifications.service';
import { TenantService } from '../src/common/services/tenant.service';
import { Notification, NotificationTrigger } from '../src/notifications/notification.entity';

describe('NotificationsService (unit)', () => {
  let service: NotificationsService;

  const mockGymId = 'gym-test-123';

  const mockRepo: Record<string, jest.Mock> = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockTenantService = {
    gymId: mockGymId,
    safeGymId: mockGymId,
    setTenantContext: jest.fn(),
    runInTenantContext: jest.fn().mockImplementation((_gymId: string, fn: Function) => fn()),
  };

  const createMockNotification = (overrides = {}): Notification => ({
    id: 'n1',
    user_id: '',
    gym_id: mockGymId,
    channel: NotificationChannel.IN_APP,
    message: '',
    trigger: NotificationTrigger.MANUAL,
    status: NotificationStatus.PENDING,
    sentAt: undefined,
    createdAt: new Date(),
    ...overrides,
  } as Notification);

  enum NotificationChannel {
    WHATSAPP = 'whatsapp',
    EMAIL = 'email',
    IN_APP = 'in-app',
  }

  enum NotificationTrigger {
    INACTIVITY = 'inactivity',
    LOW_FEEDBACK = 'low_feedback',
    HIGH_RISK = 'high_risk',
    MILESTONE = 'milestone',
    MANUAL = 'manual',
  }

  enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed',
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockRepo },
        { provide: TenantService, useValue: mockTenantService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create notification with tenant gymId', async () => {
      const saved = createMockNotification({ user_id: 'u1' });
      (mockRepo.save as jest.Mock).mockResolvedValue(saved);

      const result = await service.create({
        user_id: 'u1',
        channel: 'in-app',
        message: 'Test message',
        trigger: NotificationTrigger.HIGH_RISK,
      });

      expect(result).toBeDefined();
      expect(result.gym_id).toBe(mockGymId);
      expect(result.user_id).toBe('u1');
    });
  });

  describe('findByUser', () => {
    it('should filter by user and tenant gymId', async () => {
      (mockRepo.find as jest.Mock).mockResolvedValue([]);
      await service.findByUser('user-1');

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { user_id: 'user-1', gym_id: mockGymId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('markAsSent', () => {
    it('should update status to sent', async () => {
      await service.markAsSent('n1');
      expect(mockRepo.update).toHaveBeenCalledWith('n1', { status: 'sent' as any, sentAt: expect.any(Date) });
    });
  });

  describe('markAsFailed', () => {
    it('should update status to failed', async () => {
      await service.markAsFailed('n1');
      expect(mockRepo.update).toHaveBeenCalledWith('n1', { status: 'failed' as any });
    });
  });
});