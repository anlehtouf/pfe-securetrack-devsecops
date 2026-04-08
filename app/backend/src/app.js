const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');
const { metricsMiddleware, metricsEndpoint } = require('./utils/metrics');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================

// V14: INTENTIONAL VULNERABILITY — CORS wildcard allows any origin
// FIX: cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' })
app.use(cors({ origin: '*' }));

// V9: INTENTIONAL VULNERABILITY — Debug mode enabled in error handler
// FIX: Set debug: false or use NODE_ENV check
app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));

// V10: INTENTIONAL VULNERABILITY — Missing helmet security headers
// FIX: app.use(helmet());

// Prometheus metrics
app.use(metricsMiddleware);

// ============================================================
// ROUTES
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/health', healthRoutes);
app.get('/api/metrics', metricsEndpoint);

// Error handler — V9: debug mode enabled
app.use(errorHandler({ debug: true }));

// ============================================================
// SERVER
// ============================================================
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`SecureTrack API running on port ${PORT}`); // eslint-disable-line no-console
  });
}

module.exports = app;
