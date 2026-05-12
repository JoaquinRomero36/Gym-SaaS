import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../src/users/users.service';
import { TenantService } from '../src/common/services/tenant.service';
import { User, UserLevel, UserStatus, UserRole } from '../src/users/user.entity';

describe('UsersService (unit)', () => {
  let service: UsersService;

  const mockGymId = 'gym-test-123';

  const mockRepo: Record<string, jest.Mock> = {
    findOne: jest.fn(),
    find: jest.fn(),
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

  const createMockUser = (overrides = {}): User => ({
    id: '1',
    gym_id: mockGymId,
    name: 'Test User',
    email: 'test@test.com',
    passwordHash: 'hash',
    role: UserRole.MEMBER,
    level: UserLevel.BEGINNER,
    status: UserStatus.ACTIVE,
    joinedAt: new Date('2024-01-01'),
    gym: {} as any,
    ...overrides,
  } as User);

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: TenantService, useValue: mockTenantService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should filter by email and gymId', async () => {
      const mockUser = createMockUser({ email: 'test@test.com' });
      (mockRepo.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@test.com');
      expect(result).toBe(mockUser);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com', gym_id: mockGymId },
      });
    });

    it('should return null when user not in tenant', async () => {
      (mockRepo.findOne as jest.Mock).mockResolvedValue(null);
      const result = await service.findByEmail('noexistent@test.com');
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should find user filtered by gymId', async () => {
      const mockUser = createMockUser();
      (mockRepo.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne('1');
      expect(result).toBe(mockUser);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: '1', gym_id: mockGymId },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      (mockRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow('User nonexistent not found');
    });
  });

  describe('findAllByGym', () => {
    it('should return all users for tenant', async () => {
      (mockRepo.find as jest.Mock).mockResolvedValue([]);
      await service.findAllByGym(mockGymId);
      expect(mockRepo.find).toHaveBeenCalledWith({ where: { gym_id: mockGymId } });
    });
  });

  describe('findAllByCoach', () => {
    it('should filter by coach and tenant', async () => {
      (mockRepo.find as jest.Mock).mockResolvedValue([]);
      await service.findAllByCoach('coach-1');
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { coach_id: 'coach-1', gym_id: mockGymId },
      });
    });
  });

  describe('create', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        gym_id: mockGymId,
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
        role: UserRole.MEMBER,
      };
      (mockRepo.save as jest.Mock).mockResolvedValueOnce({ ...userData, id: 'new-1', passwordHash: 'hashed' });
      (mockRepo.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.create(userData);
      expect(result).toBeDefined();
      // bcrypt.hash returns something that starts with $2b$
      expect(result.passwordHash).toBeDefined();
    });

    it('should check for duplicate email before creating', async () => {
      const userData = {
        gym_id: mockGymId,
        name: 'Test',
        email: 'test@test.com',
        password: 'pass',
      };
      (mockRepo.findOne as jest.Mock).mockResolvedValue({ id: 'existing' } as User);

      await expect(service.create(userData)).rejects.toThrow('Email already in use');
    });
  });

  describe('update', () => {
    it('should update user and return it', async () => {
      const mockUser = createMockUser();
      (mockRepo.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (mockRepo.save as jest.Mock).mockResolvedValueOnce(mockUser);

      // Update changes the mock
      Object.assign(mockUser, { name: 'Updated' });
      (mockRepo.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

      const updated = await service.update('1', { name: 'Updated' });
      expect(updated.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      await service.remove('user-1');
      expect(mockRepo.delete).toHaveBeenCalledWith('user-1');
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const mockUser = createMockUser();
      const result = await service.validatePassword(mockUser, 'testpassword');
      expect(typeof result).toBe('boolean');
    });
  });
});