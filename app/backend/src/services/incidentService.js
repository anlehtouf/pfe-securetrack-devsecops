const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const list = async ({ status, severity, search }) => {
  const where = {};
  if (status) where.status = status;
  if (severity) where.severity = severity;

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const incidents = await prisma.incident.findMany({
    where,
    include: {
      reportedBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return incidents;
};

const create = async ({ title, description, severity, reportedById }) => {
  const incident = await prisma.incident.create({
    data: {
      title,
      description,
      severity,
      status: 'OPEN',
      reportedById,
    },
    include: {
      reportedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return incident;
};

const getById = async (id) => {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      reportedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return incident;
};

const update = async (id, data) => {
  const updateData = {};
  if (data.status) updateData.status = data.status;
  if (data.severity) updateData.severity = data.severity;
  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;

  const incident = await prisma.incident.update({
    where: { id },
    data: updateData,
    include: {
      reportedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return incident;
};

const getStats = async () => {
  const [total, bySeverity, byStatus] = await Promise.all([
    prisma.incident.count(),
    prisma.incident.groupBy({
      by: ['severity'],
      _count: { severity: true },
    }),
    prisma.incident.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ]);

  return {
    total,
    bySeverity: bySeverity.reduce((acc, item) => {
      acc[item.severity] = item._count.severity;
      return acc;
    }, {}),
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {}),
  };
};

module.exports = { list, create, getById, update, getStats };
