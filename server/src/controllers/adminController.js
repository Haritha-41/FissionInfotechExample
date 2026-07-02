const Reservation = require('../models/Reservation');
const { findAvailableTable } = require('../utils/availability');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/reservations           — all reservations
// GET /api/admin/reservations?date=...   — filtered by date (YYYY-MM-DD)
const listReservations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.date) filter.reservationDate = req.query.date;

  const reservations = await Reservation.find(filter)
    .populate('table')
    .populate('user', 'name email')
    .sort({ reservationDate: 1, timeSlot: 1 });

  res.json(reservations);
});

// PATCH /api/admin/reservations/:id  — update any reservation.
// Accepts reservationDate, timeSlot, guests. If any change on an active
// reservation, a fitting table is reassigned (excluding this reservation).
const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return res.status(404).json({ message: 'Reservation not found' });
  }

  const reservationDate = req.body.reservationDate ?? reservation.reservationDate;
  const timeSlot = req.body.timeSlot ?? reservation.timeSlot;
  const guests = req.body.guests ?? reservation.guests;

  if (reservation.status === 'active') {
    const table = await findAvailableTable(
      reservationDate,
      timeSlot,
      guests,
      reservation._id
    );
    if (!table) {
      return res.status(409).json({
        message: 'No table available for the requested change',
      });
    }
    reservation.table = table._id;
  }

  reservation.reservationDate = reservationDate;
  reservation.timeSlot = timeSlot;
  reservation.guests = guests;
  await reservation.save();

  res.json(await reservation.populate(['table', { path: 'user', select: 'name email' }]));
});

// PATCH /api/admin/reservations/:id/cancel  — cancel any reservation.
const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return res.status(404).json({ message: 'Reservation not found' });
  }
  if (reservation.status === 'cancelled') {
    return res.status(400).json({ message: 'Already cancelled' });
  }

  reservation.status = 'cancelled';
  await reservation.save();
  res.json(reservation);
});

module.exports = { listReservations, updateReservation, cancelReservation };
