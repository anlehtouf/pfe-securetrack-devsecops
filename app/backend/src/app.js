const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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

// Security headers
app.use(helmet());

// Restrict CORS to configured origin only
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));

app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));

// Prometheus metrics
app.use(metricsMiddleware);

// ============================================================
// ROUTES
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/health', healthRoutes);
app.get('/api/metrics', metricsEndpoint);

// Error handler — no debug info in production
app.use(errorHandler({ debug: process.env.NODE_ENV === 'development' }));

// ============================================================
// SERVER
// ============================================================
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`SecureTrack API running on port ${PORT}`); // eslint-disable-line no-console
  });
}

module.exports = app;
