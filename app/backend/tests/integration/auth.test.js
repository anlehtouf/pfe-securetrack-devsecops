const request = require('supertest');
const app = require('../../src/app');

// Mock Prisma for integration tests (use real DB in CI with test database)
jest.mock('@prisma/client', () => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('password123', 12);

  const mockPrisma = {
    user: {
      findUnique: jest.fn((args) => {
        if (args.where.email === 'existing@test.com') {
          return Promise.resolve({
            id: 'uuid-1',
            email: 'existing@test.com',
            password: hashedPassword,
            name: 'Existing User',
            role: 'REPORTER',
          });
        }
        return Promise.resolve(null);
      }),
      create: jest.fn((args) =>
        Promise.resolve({
          id: 'uuid-new',
          email: args.data.email,
          name: args.data.name,
          role: args.data.role,
        })
      ),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@test.com', password: 'securepass123', name: 'New User' });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User created');
      expect(res.body.user.email).toBe('new@test.com');
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: '12', name: 'Test' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'existing@test.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('existing@test.com');
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrongpass' });

      expect(res.statusCode).toBe(401);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });
});
