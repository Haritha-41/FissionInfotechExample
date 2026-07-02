function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// Centralized error handler. Translates known DB errors to clean HTTP codes.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  // Duplicate key — e.g. the reservation unique index caught a race.
  if (err.code === 11000) {
    status = 409;
    message = 'That table was just booked for this slot. Please try again.';
  }
  // Mongoose validation / bad ObjectId.
  if (err.name === 'ValidationError') status = 400;
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
