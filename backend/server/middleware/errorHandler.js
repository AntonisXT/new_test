module.exports = (err, _req, res, _next) => {
  const status = err.status || 500;
  const payload = {
    code: err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
    message: err.message || 'Something went wrong',
  };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
};
