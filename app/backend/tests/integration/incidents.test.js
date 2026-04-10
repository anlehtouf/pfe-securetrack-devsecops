const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

// Generate a valid token using the environment JWT secret
const token = jwt.sign({ id: 'user-1', email: 'test@test.com', role: 'REPORTER' }, process.env.JWT_SECRET || 'test-secret-for-ci', { expiresIn: '1h' });

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockIncidents = [
    { id: 'inc-1', title: 'Test Incident', severity: 'HIGH', status: 'OPEN', reportedBy: { id: 'user-1', name: 'Test', email: 'test@test.com' } },
  ];

  const mockPrisma = {
    incident: {
      findMany: jest.fn().mockResolvedValue(mockIncidents),
      findUnique: jest.fn((args) => {
        if (args.where.id === 'inc-1') return Promise.resolve(mockIncidents[0]);
        return Promise.resolve(null);
      }),
      create: jest.fn((args) =>
        Promise.resolve({
          id: 'inc-new',
          ...args.data,
          reportedBy: { id: 'user-1', name: 'Test', email: 'test@test.com' },
        })
      ),
      update: jest.fn((args) =>
        Promise.resolve({ id: args.where.id, ...args.data, title: 'Updated' })
      ),
      count: jest.fn().mockResolvedValue(5),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    $queryRawUnsafe: jest.fn().mockResolvedValue([]),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('Incidents API', () => {
  describe('GET /api/incidents', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/incidents');
      expect(res.statusCode).toBe(401);
    });

    it('should return incidents with valid token', async () => {
      const res = await request(app)
        .get('/api/incidents')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/incidents', () => {
    it('should create an incident', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Incident', description: 'Description', severity: 'HIGH' });

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('New Incident');
    });

    it('should return 400 for invalid severity', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test', description: 'Desc', severity: 'INVALID' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Only Title' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/incidents/:id', () => {
    it('should return incident by id', async () => {
      const res = await request(app)
        .get('/api/incidents/inc-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe('inc-1');
    });

    it('should return 404 for non-existent incident', async () => {
      const res = await request(app)
        .get('/api/incidents/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/incidents/stats', () => {
    it('should return statistics', async () => {
      const res = await request(app)
        .get('/api/incidents/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('total');
    });
  });
});
