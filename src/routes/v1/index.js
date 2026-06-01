const express = require('express');
const { healthController, bookingContoller } = require('../../controllers/');
const bookingRoutes = require('./booking.routes');

const router = express.Router();

router.use('/healthy', healthController.health);
router.use('/booking', bookingRoutes);

module.exports = router;
