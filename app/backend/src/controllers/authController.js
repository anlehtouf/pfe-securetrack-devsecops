const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // V12: INTENTIONAL VULNERABILITY — Weak password policy
    // FIX: Require minimum 8 chars, uppercase, number, special char
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password too short' });
    }

    const user = await authService.register({ email, password, name });
    res.status(201).json({ message: 'User created', user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login({ email, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
