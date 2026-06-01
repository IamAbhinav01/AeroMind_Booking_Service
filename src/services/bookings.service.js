const { default: axios } = require('axios');
const { StatusCodes } = require('http-status-codes');
const { LoggerConfig, ServerConfig } = require('../config');
const { ErrorHandler } = require('../errors');
const { BookingRepository } = require('../repositories');
const db = require('../models');

const bookingRepository = new BookingRepository();

const createBooking = async (request) => {
  const t = await db.sequelize.transaction();
  try {
    const response = await axios.get(
      `${ServerConfig.FLIGHT_API}/${request.flightId}`
    );
    const flightDetails = response.data.data;

    if (request.noOfSeats > flightDetails.totalSeats) {
      await t.rollback();
      throw new ErrorHandler(
        `Not enough seats. Requested: ${request.noOfSeats}, Available: ${flightDetails.totalSeats}`,
        StatusCodes.BAD_REQUEST
      );
    }

    LoggerConfig.info(
      `[Locking] Fetched flight ${request.flightId}: ${flightDetails.totalSeats} seats available`
    );

    const totalCost = request.noOfSeats * flightDetails.price;

    await axios.patch(`${ServerConfig.FLIGHT_API}/${request.flightId}/seats`, {
      seats: request.noOfSeats,
      dec: true,
    });

    LoggerConfig.info(
      `[Locking] Seat count updated for flight ${request.flightId}`
    );

    const booking = await bookingRepository.create(
      {
        flightId: request.flightId,
        userId: request.userId,
        noOfSeats: request.noOfSeats,
        totalCost,
      },
      t
    );

    await t.commit();

    LoggerConfig.info(
      `[Locking] Booking ${booking.id} committed successfully for user ${request.userId}`
    );

    return booking;
  } catch (error) {
    try {
      await t.rollback();
      LoggerConfig.warn(`[Locking] Transaction rolled back: ${error.message}`);
    } catch (rollbackError) {
      LoggerConfig.error(`[Locking] Rollback failed: ${rollbackError.message}`);
    }

    if (error instanceof ErrorHandler) throw error;

    let explanation = error.message;
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

    if (error.name === 'SequelizeValidationError') {
      explanation = error.errors.map((err) => err.message).join(', ');
      statusCode = StatusCodes.BAD_REQUEST;
    }

    LoggerConfig.error(
      `[Locking] Error in createBooking — ${error.name}: ${error.message}`
    );
    throw new ErrorHandler(explanation, statusCode);
  }
};

module.exports = { createBooking };
