const express = require('express');
const { bookingContoller } = require('../../controllers');
const router = express.Router();

router.post('/', bookingContoller.createBookings);
router.post('/payment', bookingContoller.makePayment);
router.post('/cancel', bookingContoller.cancelBooking);

module.exports = router;
