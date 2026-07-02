const express = require('express');
const { body, query } = require('express-validator');
const {
  listReservations,
  updateReservation,
  cancelReservation,
} = require('../controllers/adminController');
const { createTable, updateTable } = require('../controllers/tableController');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { TIME_SLOTS } = require('../utils/constants');

const router = express.Router();

// Every admin route requires auth + admin role.
router.use(protect, requireRole('admin'));

// Reservations
router.get(
  '/reservations',
  [query('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD')],
  validate,
  listReservations
);

router.patch(
  '/reservations/:id',
  [
    body('reservationDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    body('timeSlot').optional().isIn(TIME_SLOTS),
    body('guests').optional().isInt({ min: 1, max: 20 }),
  ],
  validate,
  updateReservation
);

router.patch('/reservations/:id/cancel', cancelReservation);

// Tables
router.post(
  '/tables',
  [
    body('tableNumber').isInt({ min: 1 }).withMessage('tableNumber must be a positive int'),
    body('capacity').isInt({ min: 1 }).withMessage('capacity must be a positive int'),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  createTable
);

router.patch('/tables/:id', updateTable);

module.exports = router;
