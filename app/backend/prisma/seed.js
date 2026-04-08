const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@securetrack.local' },
    update: {},
    create: {
      email: 'admin@securetrack.local',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create reporter user
  const reporterPassword = await bcrypt.hash('reporter123', 12);
  const reporter = await prisma.user.upsert({
    where: { email: 'reporter@securetrack.local' },
    update: {},
    create: {
      email: 'reporter@securetrack.local',
      password: reporterPassword,
      name: 'Test Reporter',
      role: 'REPORTER',
    },
  });

  // Create sample incidents
  const incidents = [
    { title: 'Unauthorized access attempt detected', description: 'Multiple failed login attempts from IP 192.168.1.100', severity: 'HIGH', status: 'OPEN', reportedById: reporter.id },
    { title: 'SSL certificate expiring soon', description: 'Production SSL certificate expires in 14 days', severity: 'MEDIUM', status: 'IN_PROGRESS', reportedById: admin.id },
    { title: 'Outdated dependency found', description: 'lodash@4.17.20 has known prototype pollution vulnerability', severity: 'HIGH', status: 'OPEN', reportedById: reporter.id },
    { title: 'Exposed debug endpoint', description: 'Debug mode is enabled in production error handler', severity: 'CRITICAL', status: 'OPEN', reportedById: admin.id },
    { title: 'Missing security headers', description: 'X-Frame-Options and CSP headers not configured', severity: 'MEDIUM', status: 'OPEN', reportedById: reporter.id },
  ];

  for (const incident of incidents) {
    await prisma.incident.create({ data: incident });
  }

  console.log('Database seeded successfully'); // eslint-disable-line no-console
  console.log(`Admin: ${admin.email}`); // eslint-disable-line no-console
  console.log(`Reporter: ${reporter.email}`); // eslint-disable-line no-console
}

main()
  .catch((e) => {
    console.error(e); // eslint-disable-line no-console
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
