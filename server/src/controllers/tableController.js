const Table = require('../models/Table');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/tables  — public list of active tables (for the reservation form).
const listTables = asyncHandler(async (req, res) => {
  const tables = await Table.find({ isActive: true }).sort({ tableNumber: 1 });
  res.json(tables);
});

// POST /api/admin/tables  — admin creates a table.
const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, capacity, isActive } = req.body;

  if (await Table.findOne({ tableNumber })) {
    return res.status(409).json({ message: 'Table number already exists' });
  }

  const table = await Table.create({ tableNumber, capacity, isActive });
  res.status(201).json(table);
});

// PATCH /api/admin/tables/:id  — admin updates a table.
const updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!table) return res.status(404).json({ message: 'Table not found' });
  res.json(table);
});

module.exports = { listTables, createTable, updateTable };
