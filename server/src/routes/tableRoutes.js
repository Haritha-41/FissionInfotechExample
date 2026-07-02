const express = require('express');
const { listTables } = require('../controllers/tableController');

const router = express.Router();

// Public: the reservation form needs to know table capacities available.
router.get('/', listTables);

module.exports = router;
