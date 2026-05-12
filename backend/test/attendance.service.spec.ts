import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceService } from '../src/attendance/attendance.service';
import { TenantService } from '../src/common/services/tenant.service';
import { AttendanceLog } from '../src/attendance/attendance-log.entity';

describe('AttendanceService (unit)', () => {
  let service: AttendanceService;
  let repo: Repository<AttendanceLog>;

  const mockGymId = 'gym-test-123';

  const mockRepo = {
    create: jest.fn().mockImplementation((data) => data),
    save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    find: jest.fn().mockImplementation(() => []),
    findOne: jest.fn().mockImplementation(() => null),
    count: jest.fn().mockResolvedValue(0),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockTenantService = {
    gymId: mockGymId,
    safeGymId: mockGymId,
    setTenantContext: jest.fn(),
    runInTenantContext: jest.fn().mockImplementation((_gymId: string, fn: Function) => fn()),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: getRepositoryToken(AttendanceLog), useValue: mockRepo },
        { provide: TenantService, useValue: mockTenantService },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should use tenant gymId by default', async () => {
      const dto = { user_id: 'user-1', date: '2025-01-01' };
      const result = await service.create(dto);
      expect(result.gym_id).toBe(mockGymId);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should use explicit gymId when provided', async () => {
      const dto = { user_id: 'user-1', date: '2025-01-01' };
      const result = await service.create(dto, 'explicit-gym-id');
      expect(result.gym_id).toBe('explicit-gym-id');
    });

    it('should mark completed as false by default', async () => {
      const dto = { user_id: 'user-1', date: '2025-01-01' };
      const result = await service.create(dto);
      expect(result.completed).toBe(false);
    });
  });

  describe('findByUser', () => {
    it('should filter by user and gymId', async () => {
      await service.findByUser('user-1');
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { user_id: 'user-1', gym_id: mockGymId },
        order: { date: 'DESC' },
      });
    });
  });

  describe('getLastAttendance', () => {
    it('should return null when no attendance', async () => {
      const result = await service.getLastAttendance('user-1');
      expect(result).toBeNull();
    });

    it('should filter by user and gymId', async () => {
      const mockLog = { id: '1', user_id: 'user-1', gym_id: mockGymId } as AttendanceLog;
      (mockRepo.find as jest.Mock).mockResolvedValue([mockLog]);

      const result = await service.getLastAttendance('user-1');
      expect(result).toBe(mockLog);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { user_id: 'user-1', gym_id: mockGymId },
        order: { date: 'DESC' },
        take: 1,
      });
    });
  });

  describe('countInRange', () => {
    it('should filter by user, gymId and date range', async () => {
      (mockRepo.count as jest.Mock).mockResolvedValue(5);
      const count = await service.countInRange('user-1', 7);
      expect(count).toBe(5);
      const callWhere = (mockRepo.count as jest.Mock).mock.calls[0][0].where;
      expect(callWhere.user_id).toBe('user-1');
      expect(callWhere.gym_id).toBe(mockGymId);
    });
  });
});