const express = require('express');
const { bookingContoller } = require('../../controllers');
const { BookingMiddleware } = require('../../middlewares');
const router = express.Router();

router.post(
  '/',
  BookingMiddleware.creationMiddleware,
  bookingContoller.createBookings
);
router.post(
  '/payment',
  BookingMiddleware.paymentMiddlware,
  bookingContoller.makePayment
);
router.delete(
  '/cancel',
  BookingMiddleware.cancelMiddleware,
  bookingContoller.cancelBooking
);

module.exports = router;
