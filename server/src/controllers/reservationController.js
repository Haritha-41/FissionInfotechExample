const Reservation = require('../models/Reservation');
const { findAvailableTable } = require('../utils/availability');
const asyncHandler = require('../utils/asyncHandler');

const todayStr = () => new Date().toISOString().slice(0, 10);

// POST /api/reservations  — customer creates a reservation.
const createReservation = asyncHandler(async (req, res) => {
  const { reservationDate, timeSlot, guests } = req.body;

  // No reservations in the past (string compare is safe for YYYY-MM-DD).
  if (reservationDate < todayStr()) {
    return res.status(400).json({ message: 'Cannot reserve a past date' });
  }

  const table = await findAvailableTable(reservationDate, timeSlot, guests);
  if (!table) {
    return res.status(409).json({
      message: 'No table available for that date, time, and party size',
    });
  }

  // Unique index backstops any race between the check above and this create.
  const reservation = await Reservation.create({
    user: req.user._id,
    table: table._id,
    reservationDate,
    timeSlot,
    guests,
  });

  res.status(201).json(await reservation.populate('table'));
});

// GET /api/reservations/my  — only the caller's reservations.
const myReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('table')
    .sort({ reservationDate: 1, timeSlot: 1 });
  res.json(reservations);
});

// PATCH /api/reservations/:id/cancel  — customer cancels own reservation.
const cancelMyReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return res.status(404).json({ message: 'Reservation not found' });
  }
  // Ownership check — customers cannot touch others' reservations.
  if (String(reservation.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not your reservation' });
  }
  if (reservation.status === 'cancelled') {
    return res.status(400).json({ message: 'Already cancelled' });
  }

  reservation.status = 'cancelled';
  await reservation.save();
  res.json(await reservation.populate('table'));
});

module.exports = { createReservation, myReservations, cancelMyReservation };
