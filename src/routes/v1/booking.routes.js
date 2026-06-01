const express = require('express');
const { bookingContoller } = require('../../controllers');
const router = express.Router();

router.post('/', bookingContoller.createBookings);

module.exports = router;
