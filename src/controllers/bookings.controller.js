const { StatusCodes } = require('http-status-codes');
const { LoggerConfig } = require('../config');
const { sucessResponse, errorResponse } = require('../utils/responseFormatter');
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

module.exports = { createBookings };
