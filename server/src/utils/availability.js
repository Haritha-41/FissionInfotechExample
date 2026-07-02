const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

// Core reservation logic. Given a date/slot/party size, return the SMALLEST
// active table that (a) fits the party and (b) isn't already booked for that
// date + slot. Returns null when nothing is available.
// `excludeReservationId` lets an admin edit re-check availability without the
// reservation being edited counting as a conflict against itself.
async function findAvailableTable(
  reservationDate,
  timeSlot,
  guests,
  excludeReservationId = null
) {
  // Candidates: active + big enough, smallest capacity first so we assign the
  // tightest fit and keep larger tables free for larger parties.
  const candidates = await Table.find({
    isActive: true,
    capacity: { $gte: guests },
  }).sort({ capacity: 1, tableNumber: 1 });

  if (candidates.length === 0) return null;

  // Tables already taken for this exact date + slot.
  const conflictQuery = {
    reservationDate,
    timeSlot,
    status: 'active',
  };
  if (excludeReservationId) conflictQuery._id = { $ne: excludeReservationId };

  const bookedTableIds = await Reservation.find(conflictQuery).distinct('table');

  const booked = new Set(bookedTableIds.map(String));
  return candidates.find((t) => !booked.has(String(t._id))) || null;
}

module.exports = { findAvailableTable };
