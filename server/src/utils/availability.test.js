// Self-check for the core reservation-assignment logic. No DB required:
// we stub Table.find / Reservation.find. Run with: node src/utils/availability.test.js
const assert = require('assert');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const { findAvailableTable } = require('./availability');

const TABLES = [
  { _id: 't1', tableNumber: 1, capacity: 2, isActive: true },
  { _id: 't2', tableNumber: 2, capacity: 4, isActive: true },
  { _id: 't3', tableNumber: 3, capacity: 6, isActive: true },
];

// Stub Table.find(...).sort(...) -> tables with capacity >= guests, smallest first.
Table.find = (q) => ({
  sort: () =>
    Promise.resolve(
      TABLES.filter((t) => t.isActive && t.capacity >= q.capacity.$gte).sort(
        (a, b) => a.capacity - b.capacity
      )
    ),
});

// Stub Reservation.find(...).distinct('table') -> configurable booked ids.
let bookedIds = [];
Reservation.find = (q) => ({
  distinct: () =>
    Promise.resolve(
      bookedIds.filter((b) => !(q._id && b === q._id.$ne_marker)) // (excludeId handled below)
    ),
});

async function run() {
  // 1. Smallest fitting table is chosen (party of 2 -> table 1, cap 2).
  bookedIds = [];
  let t = await findAvailableTable('2999-01-01', '18:00', 2);
  assert.strictEqual(t._id, 't1', 'should pick smallest fitting table');

  // 2. Party too big for any table -> null.
  bookedIds = [];
  t = await findAvailableTable('2999-01-01', '18:00', 99);
  assert.strictEqual(t, null, 'no table fits a party of 99');

  // 3. Smallest table booked -> next fitting table chosen.
  bookedIds = ['t1'];
  t = await findAvailableTable('2999-01-01', '18:00', 2);
  assert.strictEqual(t._id, 't2', 'should skip booked table and pick next');

  // 4. All fitting tables booked -> null.
  bookedIds = ['t1', 't2', 't3'];
  t = await findAvailableTable('2999-01-01', '18:00', 2);
  assert.strictEqual(t, null, 'all tables booked -> none available');

  console.log('availability self-check passed');
}

run().catch((err) => {
  console.error('availability self-check FAILED:', err.message);
  process.exit(1);
});
