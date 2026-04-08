const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// V (Semgrep custom rule): No rate limiter on login endpoint
// FIX: const limiter = require('../middleware/rateLimiter'); then router.post('/login', limiter, ...)
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
