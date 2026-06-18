const { StatusCodes } = require('http-status-codes');
const { LoggerConfig } = require('../config');
const { ErrorHandler } = require('../errors');
const { errorResponse } = require('../utils/responseFormatter');
const {
  BOOKING_ID,
  USER_ID,
  NO_OF_SEATS,
  FLIGHT_ID,
  TOTAL_COST,
} = require('../utils/common/bookingMiddleware.constant');

const creationMiddleware = async (req, res, next) => {
  const body = req.body || {};
  const requiredFields = [FLIGHT_ID, USER_ID, NO_OF_SEATS];
  for (const field of requiredFields) {
    if (!body[field]) {
      const message = `Booking ${field} is not defined`;
      const responsePayload = {
        ...errorResponse,
        message,
        error: new ErrorHandler(message, StatusCodes.BAD_REQUEST),
      };

      LoggerConfig.error(
        `Booking ${field} not defined, ERROR Name: ${responsePayload.error.name}, ERROR Message: ${responsePayload.error.message}`
      );
      return res.status(StatusCodes.BAD_REQUEST).json(responsePayload);
    }
  }
  next();
};

const paymentMiddlware = async (req, res, next) => {
  const body = req.body || {};
  const requiredFields = [TOTAL_COST, USER_ID, BOOKING_ID];
  for (const field of requiredFields) {
    if (!body[field]) {
      const message = `Booking ${field} is not defined`;
      const responsePayload = {
        ...errorResponse,
        message,
        error: new ErrorHandler(message, StatusCodes.BAD_REQUEST),
      };

      LoggerConfig.error(
        `Booking ${field} not defined, ERROR Name: ${responsePayload.error.name}, ERROR Message: ${responsePayload.error.message}`
      );
      return res.status(StatusCodes.BAD_REQUEST).json(responsePayload);
    }
  }
  next();
};

const cancelMiddleware = async (req, res, next) => {
  const body = req.body || {};
  const requiredFields = [BOOKING_ID];
  for (const field of requiredFields) {
    if (!body[field]) {
      const message = `Booking ${field} is not defined`;
      const responsePayload = {
        ...errorResponse,
        message,
        error: new ErrorHandler(message, StatusCodes.BAD_REQUEST),
      };

      LoggerConfig.error(
        `Booking ${field} not defined, ERROR Name: ${responsePayload.error.name}, ERROR Message: ${responsePayload.error.message}`
      );
      return res.status(StatusCodes.BAD_REQUEST).json(responsePayload);
    }
  }
  next();
};

module.exports = {
  creationMiddleware,
  paymentMiddlware,
  cancelMiddleware,
};
