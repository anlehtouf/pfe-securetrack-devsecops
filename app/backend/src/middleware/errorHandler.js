const errorHandler = (options = {}) => {
  return (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    const response = {
      error: message,
      statusCode,
    };

    // V9: INTENTIONAL VULNERABILITY — Debug mode exposes stack traces
    // FIX: Only enable in development, or remove entirely
    if (options.debug) {
      response.stack = err.stack;
      response.details = err.toString();
    }

    if (statusCode === 500) {
      console.error('Unhandled error:', err); // eslint-disable-line no-console
    }

    res.status(statusCode).json(response);
  };
};

module.exports = errorHandler;
