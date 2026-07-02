const mongoose = require('mongoose');
const { TIME_SLOTS } = require('../utils/constants');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    // Stored as a plain "YYYY-MM-DD" string so date matching is an exact
    // equality check, free of timezone range-query pitfalls.
    reservationDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    timeSlot: { type: String, required: true, enum: TIME_SLOTS },
    guests: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Hard guarantee against double booking: a table can hold only ONE active
// reservation per date + slot. Partial index so cancelled rows don't block
// rebooking. This backstops the availability service against races.
reservationSchema.index(
  { table: 1, reservationDate: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

module.exports = mongoose.model('Reservation', reservationSchema);
