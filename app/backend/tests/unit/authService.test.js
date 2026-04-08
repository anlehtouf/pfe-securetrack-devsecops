const bcrypt = require('bcryptjs');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authService = require('../../src/services/authService');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const userData = { email: 'test@test.com', password: 'securepass123', name: 'Test User' };
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'uuid-1',
        email: userData.email,
        name: userData.name,
        role: 'REPORTER',
      });

      const result = await authService.register(userData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.email).toBe(userData.email);
    });

    it('should throw error if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        authService.register({ email: 'existing@test.com', password: 'pass', name: 'Test' })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@test.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'REPORTER',
      });

      const result = await authService.login({ email: 'test@test.com', password: 'password123' });

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw error for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'none@test.com', password: 'pass' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctpass', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@test.com',
        password: hashedPassword,
        role: 'REPORTER',
      });

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrongpass' })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
