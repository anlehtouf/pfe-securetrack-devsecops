const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const passwordPolicy = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordPolicy.test(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character.',
      });
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
