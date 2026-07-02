// Wraps async controllers so thrown/rejected errors reach the error handler
// without a try/catch in every function.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
