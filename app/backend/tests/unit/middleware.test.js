const jwt = require('jsonwebtoken');
const { authenticate } = require('../../src/middleware/auth');
const errorHandler = require('../../src/middleware/errorHandler');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 if no authorization header', () => {
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header has wrong format', () => {
    req.headers.authorization = 'Basic abc123';

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should call next with decoded user for valid token', () => {
    const token = jwt.sign({ id: 'user-1', email: 'test@test.com', role: 'REPORTER' }, process.env.JWT_SECRET || 'test-secret-for-ci');
    req.headers.authorization = `Bearer ${token}`;

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('user-1');
  });

  it('should return 401 for expired token', () => {
    const token = jwt.sign({ id: 'user-1' }, process.env.JWT_SECRET || 'test-secret-for-ci', { expiresIn: '0s' });
    req.headers.authorization = `Bearer ${token}`;

    // Small delay to ensure token is expired
    setTimeout(() => {
      authenticate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    }, 10);
  });
});

describe('Error Handler', () => {
  let res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return error with status code', () => {
    const error = new Error('Not Found');
    error.statusCode = 404;
    const handler = errorHandler({});

    handler(error, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Not Found' }));
  });

  it('should include stack trace in debug mode', () => {
    const error = new Error('Server Error');
    const handler = errorHandler({ debug: true });

    handler(error, {}, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ stack: expect.any(String) }));
  });

  it('should NOT include stack trace without debug mode', () => {
    const error = new Error('Server Error');
    const handler = errorHandler({ debug: false });

    handler(error, {}, res, next);

    const response = res.json.mock.calls[0][0];
    expect(response.stack).toBeUndefined();
  });
});
