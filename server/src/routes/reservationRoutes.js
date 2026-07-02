const express = require('express');
const { body } = require('express-validator');
const {
  createReservation,
  myReservations,
  cancelMyReservation,
} = require('../controllers/reservationController');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { TIME_SLOTS } = require('../utils/constants');

const router = express.Router();

// All reservation routes require a logged-in user.
router.use(protect);

router.post(
  '/',
  [
    body('reservationDate')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('reservationDate must be YYYY-MM-DD'),
    body('timeSlot').isIn(TIME_SLOTS).withMessage('Invalid time slot'),
    body('guests').isInt({ min: 1, max: 20 }).withMessage('guests must be 1-20'),
  ],
  validate,
  createReservation
);

router.get('/my', myReservations);
router.patch('/:id/cancel', cancelMyReservation);

module.exports = router;
