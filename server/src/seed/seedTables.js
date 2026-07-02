// Seeds restaurant tables and one admin user. Idempotent: safe to re-run.
// Usage: npm run seed
require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const Table = require('../models/Table');
const User = require('../models/User');

const TABLES = [
  { tableNumber: 1, capacity: 2 },
  { tableNumber: 2, capacity: 2 },
  { tableNumber: 3, capacity: 4 },
  { tableNumber: 4, capacity: 4 },
  { tableNumber: 5, capacity: 6 },
  { tableNumber: 6, capacity: 8 },
];

async function seed() {
  await connectDB();

  // Tables — upsert by tableNumber so re-running doesn't duplicate.
  for (const t of TABLES) {
    await Table.updateOne(
      { tableNumber: t.tableNumber },
      { $set: { capacity: t.capacity, isActive: true } },
      { upsert: true }
    );
  }
  console.log(`Seeded ${TABLES.length} tables`);

  // Admin user — create only if missing (User pre-save hook hashes password).
  const email = (process.env.ADMIN_EMAIL || 'admin@restaurant.com').toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log(`Created admin: ${email}`);
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
