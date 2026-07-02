const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/auth/register  — always creates a customer (admins are seeded).
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.findOne({ email })) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, role: 'customer' });
  res.status(201).json({ user, token: generateToken(user._id) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ user, token: generateToken(user._id) });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, me };
