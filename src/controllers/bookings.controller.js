const { StatusCodes } = require('http-status-codes');
const { LoggerConfig } = require('../config');
const {
  sucessResponse: successResponse,
  errorResponse,
} = require('../utils/responseFormatter');
const { BookingService } = require('../services');

const createBookings = async (req, res) => {
  try {
    const booking = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.body.userId,
      noOfSeats: req.body.noOfSeats,
    });
    console.log('sucesuffuly sent data from Controller layer -> service layer');
    LoggerConfig.info(`Booking created successfully, id: ${booking.id}`);
    return res.status(StatusCodes.CREATED).json({
      ...sucessResponse,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    LoggerConfig.error(`Error while creating booking: ${error.message}`);

    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        ...errorResponse,
        message: error.message || 'Something went wrong',
        error: error,
      });
  }
};

const makePayment = async (req, res) => {
  try {
    console.log('the request body is : ', req.body);
    const response = await BookingService.makePayment({
      totalCost: req.body.totalCost,
      userId: req.body.userId,
      bookingId: req.body.bookingId,
    });
    console.log('sucesuffuly sent data from Controller layer -> service layer');
    LoggerConfig.info(`Payment made successfully, id: ${response.id}`);
    return res.status(StatusCodes.CREATED).json({
      ...sucessResponse,
      message: 'Payment made successfully',
      data: response,
    });
  } catch (error) {
    LoggerConfig.error(`Error while making payment: ${error.message}`);

    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        ...errorResponse,
        message: error.message || 'Something went wrong',
        error: error,
      });
  }
};
module.exports = { createBookings, makePayment };
