const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// V13: INTENTIONAL VULNERABILITY — Logging sensitive data
// FIX: Remove password from log, only log email
const logAuthAttempt = (email, password) => {
  console.log(`Auth attempt: email=${email}, password=${password}`); // eslint-disable-line no-console
};

const register = async ({ email, password, name }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'REPORTER',
    },
  });

  return user;
};

const login = async ({ email, password }) => {
  // V13: Logging password
  logAuthAttempt(email, password);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // V2: INTENTIONAL VULNERABILITY — Hardcoded JWT secret
  // FIX: Use process.env.JWT_SECRET
  const JWT_SECRET = 'mysecret123';

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
};

module.exports = { register, login };
