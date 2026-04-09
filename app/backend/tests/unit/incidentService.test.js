jest.mock('@prisma/client', () => {
  const mockPrisma = {
    incident: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const incidentService = require('../../src/services/incidentService');

describe('IncidentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return all incidents without filters', async () => {
      const mockIncidents = [
        { id: '1', title: 'Incident 1', severity: 'HIGH', status: 'OPEN' },
        { id: '2', title: 'Incident 2', severity: 'LOW', status: 'CLOSED' },
      ];
      prisma.incident.findMany.mockResolvedValue(mockIncidents);

      const result = await incidentService.list({});

      expect(prisma.incident.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should filter by status', async () => {
      prisma.incident.findMany.mockResolvedValue([]);

      await incidentService.list({ status: 'OPEN' });

      expect(prisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'OPEN' },
        })
      );
    });

    it('should use safe Prisma filter for search', async () => {
      prisma.incident.findMany.mockResolvedValue([]);

      await incidentService.list({ search: 'test' });

      expect(prisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: 'test', mode: 'insensitive' },
          }),
        })
      );
      expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create an incident', async () => {
      const newIncident = {
        title: 'New Incident',
        description: 'Test description',
        severity: 'HIGH',
        reportedById: 'user-1',
      };
      prisma.incident.create.mockResolvedValue({
        id: '3',
        ...newIncident,
        status: 'OPEN',
      });

      const result = await incidentService.create(newIncident);

      expect(prisma.incident.create).toHaveBeenCalled();
      expect(result.title).toBe('New Incident');
      expect(result.status).toBe('OPEN');
    });
  });

  describe('getById', () => {
    it('should return incident by id', async () => {
      prisma.incident.findUnique.mockResolvedValue({ id: '1', title: 'Found' });

      const result = await incidentService.getById('1');

      expect(result.id).toBe('1');
    });

    it('should return null for non-existent incident', async () => {
      prisma.incident.findUnique.mockResolvedValue(null);

      const result = await incidentService.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return aggregated statistics', async () => {
      prisma.incident.count.mockResolvedValue(10);
      prisma.incident.groupBy
        .mockResolvedValueOnce([
          { severity: 'HIGH', _count: { severity: 5 } },
          { severity: 'LOW', _count: { severity: 5 } },
        ])
        .mockResolvedValueOnce([
          { status: 'OPEN', _count: { status: 7 } },
          { status: 'CLOSED', _count: { status: 3 } },
        ]);

      const result = await incidentService.getStats();

      expect(result.total).toBe(10);
      expect(result.bySeverity.HIGH).toBe(5);
      expect(result.byStatus.OPEN).toBe(7);
    });
  });
});
