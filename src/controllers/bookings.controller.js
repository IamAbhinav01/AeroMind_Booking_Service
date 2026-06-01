const { StatusCodes } = require('http-status-codes');
const { LoggerConfig } = require('../config');
const { ErrorHandler } = require('../errors');
const { sucessResponse, errorResponse } = require('../utils/responseFormatter');
const { BookingService } = require('../services');
const createBookings = async (req, res) => {
  try {
    const data = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.body.userId,
      noOfSeats: req.body.noOfSeats,
    });
    sucessResponse.data = 'data recieved & sent to service layer ';
    LoggerConfig.info(`Sucessfullty sent data to service layer`);
    return res.status(StatusCodes.ACCEPTED).json(sucessResponse);
  } catch (error) {
    errorResponse.error = error;
    new ErrorHandler(errorResponse, StatusCodes.BAD_GATEWAY);
    LoggerConfig.error(`Error while creating Bookings ,details:${error}`);
    return res.status(StatusCodes.BAD_GATEWAY).json(errorResponse);
  }
};
module.exports = {
  createBookings,
};
