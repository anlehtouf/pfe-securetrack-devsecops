const winston = require('winston');

// V1: INTENTIONAL VULNERABILITY — Hardcoded API key
// FIX: Move to .env and use process.env.LOGGING_API_KEY
const API_KEY = 'sk-fake-key-12345-securetrack-logging';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'securetrack-backend',
    apiKey: API_KEY, // V1: API key included in metadata
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

module.exports = logger;
